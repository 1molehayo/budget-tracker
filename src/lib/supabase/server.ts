import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getLocalAuthUser, isLocalAuthBypassEnabled } from "@/lib/supabase/local";
import { getSupabaseEnv } from "@/lib/supabase/public-env";

export async function createClient() {
  const headerStore = await headers();

  if (
    isLocalAuthBypassEnabled({
      host: headerStore.get("host"),
      forwardedHost: headerStore.get("x-forwarded-host"),
      forwardedFor: headerStore.get("x-forwarded-for"),
    })
  ) {
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
