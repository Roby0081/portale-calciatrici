import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const loginId = String(body.loginId ?? "").trim();
    const password = String(body.password ?? "");

    if (!loginId || !password) {
      return NextResponse.json(
        { error: "ID o password non corretti." },
        { status: 401 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const secretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !publishableKey ||
      !secretKey
    ) {
      console.error(
        "Variabili Supabase mancanti."
      );

      return NextResponse.json(
        { error: "Errore del server." },
        { status: 500 }
      );
    }

    // Client amministrativo:
    // usato solo lato server.
    const adminSupabase = createClient(
      supabaseUrl,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Cerchiamo il profilo dal login_id.
    const {
      data: profile,
      error: profileError,
    } = await adminSupabase
      .from("profiles")
      .select(
        "id, role, active, login_id, team_id"
      )
      .ilike("login_id", loginId)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      !profile.active ||
      !["staff", "admin"].includes(
        profile.role
      )
    ) {
      return NextResponse.json(
        { error: "ID o password non corretti." },
        { status: 401 }
      );
    }

    // Recuperiamo l'email tecnica associata
    // all'utente Supabase Auth.
    const {
      data: authUserData,
      error: authUserError,
    } =
      await adminSupabase.auth.admin.getUserById(
        profile.id
      );

    const email =
      authUserData.user?.email;

    if (authUserError || !email) {
      console.error(
        "Errore recupero utente Auth:",
        authUserError
      );

      return NextResponse.json(
        { error: "ID o password non corretti." },
        { status: 401 }
      );
    }

    // Login normale, senza utilizzare la secret
    // key per creare la sessione utente.
    const authSupabase = createClient(
      supabaseUrl,
      publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: signInData,
      error: signInError,
    } =
      await authSupabase.auth.signInWithPassword({
        email,
        password,
      });

    if (
      signInError ||
      !signInData.session
    ) {
      return NextResponse.json(
        { error: "ID o password non corretti." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token:
        signInData.session.access_token,

      refresh_token:
        signInData.session.refresh_token,
    });
  } catch (error) {
    console.error(
      "Staff login error:",
      error
    );

    return NextResponse.json(
      { error: "Errore del server." },
      { status: 500 }
    );
  }
}