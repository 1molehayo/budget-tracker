import { createBrowserClient } from "@supabase/ssr";
import {
  getLocalAuthUser,
  getSupabaseEnv,
  isLocalAuthBypassEnabled,
} from "@/lib/supabase/local";

export function createClient() {
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
