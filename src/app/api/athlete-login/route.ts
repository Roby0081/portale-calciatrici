import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const secretKey =
  process.env.SUPABASE_SECRET_KEY!;

// Client amministrativo:
// può leggere profiles e Auth bypassando RLS.
// Deve rimanere SOLO lato server.
const supabaseAdmin = createClient(
  supabaseUrl,
  secretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// Client normale utilizzato esclusivamente
// per verificare email + password.
const supabaseAuth = createClient(
  supabaseUrl,
  publishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const loginId =
      typeof body.loginId === "string"
        ? body.loginId.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!loginId || !password) {
      return NextResponse.json(
        {
          error: "Credenziali non valide.",
        },
        {
          status: 400,
        }
      );
    }

    // 1. Cerca il profilo tramite login_id.
    // La secret key permette questa query lato server.
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, role, active, login_id"
      )
      .ilike("login_id", loginId)
      .maybeSingle();

    // Messaggio volutamente generico:
    // non diciamo se è sbagliato ID o password.
    if (
      profileError ||
      !profile ||
      !profile.active ||
      profile.role !== "athlete"
    ) {
      return NextResponse.json(
        {
          error: "ID o password non corretti.",
        },
        {
          status: 401,
        }
      );
    }

    // 2. Recupera l'account Auth associato
    // all'UUID presente in profiles.id.
    const {
      data: authData,
      error: authUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        profile.id
      );

    const email =
      authData?.user?.email;

    if (
      authUserError ||
      !email
    ) {
      console.error(
        "Errore recupero utente Auth:",
        authUserError
      );

      return NextResponse.json(
        {
          error: "ID o password non corretti.",
        },
        {
          status: 401,
        }
      );
    }

    // 3. Verifica realmente la password
    // usando il normale sistema Supabase Auth.
    const {
      data: signInData,
      error: signInError,
    } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (
      signInError ||
      !signInData.session
    ) {
      return NextResponse.json(
        {
          error: "ID o password non corretti.",
        },
        {
          status: 401,
        }
      );
    }

    // 4. Restituisce SOLO i token necessari
    // al client per impostare la sessione.
    return NextResponse.json({
      access_token:
        signInData.session.access_token,
      refresh_token:
        signInData.session.refresh_token,
    });
  } catch (error) {
    console.error(
      "Athlete login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Errore durante l'accesso.",
      },
      {
        status: 500,
      }
    );
  }
}