export type DemoSeedEnv = {
  ALLOW_DEMO_SEED?: string;
  NODE_ENV?: string;
  DATABASE_URL?: string;
  DEMO_SEED_ALLOW_REMOTE?: string;
};

/**
 * Demo seed is opt-in and local-dev oriented. Refuse production and remote
 * Neon URLs unless explicitly overridden.
 */
export function assertDemoSeedAllowed(env: DemoSeedEnv): void {
  if (env.ALLOW_DEMO_SEED !== "1") {
    throw new Error(
      "Demo seed refused: set ALLOW_DEMO_SEED=1 (e.g. `make demo-seed` or `ALLOW_DEMO_SEED=1 npm run db:seed`).",
    );
  }

  if (env.NODE_ENV === "production") {
    throw new Error(
      "Demo seed refused: NODE_ENV=production. Seed is for local/Compose demos only.",
    );
  }

  const url = env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("Demo seed refused: DATABASE_URL is not set.");
  }

  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    host = "";
  }

  const looksRemote =
    host.includes("neon.tech") ||
    host.includes("neon.build") ||
    (host.length > 0 &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "db" &&
      !host.endsWith(".local"));

  if (looksRemote && env.DEMO_SEED_ALLOW_REMOTE !== "1") {
    throw new Error(
      `Demo seed refused: DATABASE_URL host "${host}" looks remote. ` +
        "Use local Compose Postgres, or set DEMO_SEED_ALLOW_REMOTE=1 if you really mean it.",
    );
  }
}
