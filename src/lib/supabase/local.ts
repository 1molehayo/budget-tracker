const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface LocalAuthUser {
  id: string;
  email: string;
}

export function hasSupabaseEnv() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function isLocalAuthBypassEnabled() {
  return process.env.NODE_ENV !== "production" && !hasSupabaseEnv();
}

export function getSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or omit them in local development to use the built-in auth bypass."
    );
  }

  return {
    url: SUPABASE_URL as string,
    anonKey: SUPABASE_ANON_KEY as string,
  };
}

export function getLocalAuthUser(): LocalAuthUser {
  return {
    id: process.env.LOCAL_DEV_USER_ID || "local-dev-user",
    email: process.env.LOCAL_DEV_USER_EMAIL || "local@example.com",
  };
}
