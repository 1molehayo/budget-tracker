import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Mirrors the server-only opt-in so browser auth helpers can see it.
    // The bypass still requires development mode and a loopback host.
    NEXT_PUBLIC_LOCAL_AUTH_BYPASS: process.env.LOCAL_AUTH_BYPASS === "true" ? "true" : "false",
  },
};

export default nextConfig;
