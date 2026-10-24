import { createBrowserClient } from "@supabase/ssr";
import { isLoopbackRequest } from "@/lib/supabase/loopback";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/public-env";

const localAuthUser = {
  id: "local-dev-user",
  email: "local@example.com",
};

function isBrowserLocalAuthBypassEnabled(host: string | null) {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === "true" &&
    !hasSupabaseEnv() &&
    isLoopbackRequest({ host })
  );
}

export function createClient() {
  const host = typeof window !== "undefined" ? window.location.host : null;

  if (isBrowserLocalAuthBypassEnabled(host)) {
    const user = localAuthUser;

    return {
      auth: {
        async getUser() {
          return {
            data: { user },
            error: null,
          };
        },
        async signInWithPassword(credentials: { email: string; password: string }) {
          void credentials;
          return {
            data: { user, session: null },
            error: null,
          };
        },
        async signUp(credentials: { email: string; password: string }) {
          void credentials;
          return {
            data: { user, session: null },
            error: null,
          };
        },
        async signOut() {
          return {
            error: null,
          };
        },
      },
    };
  }

  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient(
    url,
    anonKey
  );
}
