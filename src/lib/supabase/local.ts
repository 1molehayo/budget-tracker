import { isLoopbackRequest, type LocalAuthRequest } from "@/lib/supabase/loopback";
import { hasSupabaseEnv } from "@/lib/supabase/public-env";

export interface LocalAuthUser {
  id: string;
  email: string;
}

export function isLocalAuthBypassEnabled(request?: LocalAuthRequest): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.LOCAL_AUTH_BYPASS === "true" &&
    !hasSupabaseEnv() &&
    isLoopbackRequest(request)
  );
}

export function getLocalAuthUser(): LocalAuthUser {
  return {
    id: process.env.LOCAL_DEV_USER_ID || "local-dev-user",
    email: process.env.LOCAL_DEV_USER_EMAIL || "local@example.com",
  };
}
