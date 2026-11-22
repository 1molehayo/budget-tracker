import { defineConfig, devices } from "@playwright/test";

const port = 3010;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // next start is production mode, which disables LOCAL_AUTH_BYPASS.
    // Clear placeholder Supabase values so the local bypass can engage.
    command: `pnpm exec next dev --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "development",
      LOCAL_AUTH_BYPASS: "true",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    },
  },
});
