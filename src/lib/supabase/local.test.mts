import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLocalAuthBypassEnabled } from "./local.ts";

const loopback = { host: "127.0.0.1:3000" };
const publicHost = { host: "203.0.113.10:3000" };

describe("local authentication bypass", { concurrency: false }, () => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    LOCAL_AUTH_BYPASS: process.env.LOCAL_AUTH_BYPASS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  function restoreEnv() {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }

  it("stays off in production even with the opt-in and a loopback host", () => {
    process.env.NODE_ENV = "production";
    process.env.LOCAL_AUTH_BYPASS = "true";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      assert.equal(isLocalAuthBypassEnabled(loopback), false);
    } finally {
      restoreEnv();
    }
  });

  it("requires the explicit opt-in during development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.LOCAL_AUTH_BYPASS;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      assert.equal(isLocalAuthBypassEnabled(loopback), false);
    } finally {
      restoreEnv();
    }
  });

  it("rejects a public host and a forwarded remote address", () => {
    process.env.NODE_ENV = "development";
    process.env.LOCAL_AUTH_BYPASS = "true";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      assert.equal(isLocalAuthBypassEnabled(publicHost), false);
      assert.equal(
        isLocalAuthBypassEnabled({ host: "127.0.0.1:3000", forwardedFor: "203.0.113.10" }),
        false
      );
      assert.equal(isLocalAuthBypassEnabled(loopback), true);
    } finally {
      restoreEnv();
    }
  });

  it("stays off when Supabase is configured", () => {
    process.env.NODE_ENV = "development";
    process.env.LOCAL_AUTH_BYPASS = "true";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

    try {
      assert.equal(isLocalAuthBypassEnabled(loopback), false);
    } finally {
      restoreEnv();
    }
  });
});
