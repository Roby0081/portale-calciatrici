import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

declare global {
  var __supabaseBrowserClient:
    | SupabaseClient
    | undefined;
}

export const supabase =
  globalThis.__supabaseBrowserClient ??
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );

if (!globalThis.__supabaseBrowserClient) {
  globalThis.__supabaseBrowserClient = supabase;
}