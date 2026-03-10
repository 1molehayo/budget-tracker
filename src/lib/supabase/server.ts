import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getLocalAuthUser,
  getSupabaseEnv,
  isLocalAuthBypassEnabled,
} from "@/lib/supabase/local";

export async function createClient() {
  if (isLocalAuthBypassEnabled()) {
    const user = getLocalAuthUser();

    return {
      auth: {
        async getUser() {
          return {
            data: { user },
            error: null,
          };
        },
      },
    };
  }

  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore cookie errors in server components
          }
        },
      },
    }
  );
}
