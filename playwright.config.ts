import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:3100",
  },
  webServer: {
    command: process.env.CI ? "next start -p 3100" : "next dev -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      AUTH_SECRET: process.env.AUTH_SECRET ?? "playwright-auth-secret",
      DEMO_PARENT_USER: process.env.DEMO_PARENT_USER ?? "parent",
      DEMO_PARENT_PASSWORD: process.env.DEMO_PARENT_PASSWORD ?? "parent123",
      DEMO_CHILD_USER: process.env.DEMO_CHILD_USER ?? "child",
      DEMO_CHILD_PASSWORD: process.env.DEMO_CHILD_PASSWORD ?? "child123",
    },
  },
});
