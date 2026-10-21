import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as webpush from "web-push";

export const runtime = "nodejs";


export async function POST(
  request: Request
) {

  try {

    // ========================================================
    // ENVIRONMENT VARIABLES
    // ========================================================

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    const vapidPublicKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const vapidPrivateKey =
      process.env.VAPID_PRIVATE_KEY;

    const vapidSubject =
      process.env.VAPID_SUBJECT;


    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !vapidPublicKey ||
      !vapidPrivateKey ||
      !vapidSubject
    ) {

      return NextResponse.json(
        {
          error:
            "Configurazione server incompleta.",
        },
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // AUTHORIZATION HEADER
    // ========================================================

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Autenticazione richiesta.",
        },
        {
          status: 401,
        }
      );
    }


    const accessToken =
      authorization.substring(
        "Bearer ".length
      );


    // ========================================================
    // SERVER-SIDE SUPABASE CLIENT
    // ========================================================

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );


    // ========================================================
    // VERIFY USER
    // ========================================================

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );


    if (
      userError ||
      !userData.user
    ) {

      return NextResponse.json(
        {
          error:
            "Sessione non valida.",
        },
        {
          status: 401,
        }
      );
    }


    const user =
      userData.user;


    // ========================================================
    // VERIFY ACTIVE ATHLETE PROFILE
    // ========================================================

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, role, active"
      )
      .eq(
        "id",
        user.id
      )
      .single();


    if (
      profileError ||
      !profile ||
      profile.role !== "athlete" ||
      profile.active !== true
    ) {

      return NextResponse.json(
        {
          error:
            "Utente non autorizzato.",
        },
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // LOAD USER PUSH SUBSCRIPTIONS
    // ========================================================

    const {
      data: subscriptions,
      error: subscriptionsError,
    } = await supabaseAdmin
      .from("push_subscriptions")
      .select(`
        id,
        endpoint,
        p256dh,
        auth_key
      `)
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "enabled",
        true
      );


    if (subscriptionsError) {

      console.error(
        "Errore lettura push subscriptions:",
        subscriptionsError
      );

      return NextResponse.json(
        {
          error:
            "Impossibile leggere le subscription.",
        },
        {
          status: 500,
        }
      );
    }


    if (
      !subscriptions ||
      subscriptions.length === 0
    ) {

      return NextResponse.json(
        {
          error:
            "Nessun dispositivo registrato per le notifiche.",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================================
    // VAPID CONFIGURATION
    // ========================================================

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );


    // ========================================================
    // TEST PAYLOAD
    // ========================================================

    const payload =
      JSON.stringify({
        title: "Performa F",

        body:
          "Notifica di prova: le notifiche sono attive.",

        url: "/",
      });


    let sentCount = 0;
    let failedCount = 0;


    // ========================================================
    // SEND TO ALL USER DEVICES
    // ========================================================

    for (
      const subscription
      of subscriptions
    ) {

      try {

        await webpush.sendNotification(
          {
            endpoint:
              subscription.endpoint,

            keys: {
              p256dh:
                subscription.p256dh,

              auth:
                subscription.auth_key,
            },
          },
          payload,
          {
            TTL: 60,
          }
        );


        sentCount += 1;

      } catch (error) {

        failedCount += 1;

        console.error(
          "Errore invio push:",
          error
        );


        // Subscription non più valida:
        // 404 / 410 vengono disattivate.

        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error

            ? Number(
                (
                  error as {
                    statusCode?: unknown;
                  }
                ).statusCode
              )

            : null;


        if (
          statusCode === 404 ||
          statusCode === 410
        ) {

          await supabaseAdmin
            .from(
              "push_subscriptions"
            )
            .update({
              enabled: false,
              updated_at:
                new Date()
                  .toISOString(),
            })
            .eq(
              "id",
              subscription.id
            );
        }
      }
    }


    // ========================================================
    // RESPONSE
    // ========================================================

    if (sentCount === 0) {

      return NextResponse.json(
        {
          error:
            "Nessuna notifica è stata inviata.",
          sent: sentCount,
          failed: failedCount,
        },
        {
          status: 502,
        }
      );
    }


    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
    });

  } catch (error) {

    console.error(
      "Errore test push:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Errore interno durante l'invio della notifica.",
      },
      {
        status: 500,
      }
    );
  }
}