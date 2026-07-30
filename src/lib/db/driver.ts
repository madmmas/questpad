export type DatabaseDriver = "neon-http" | "postgres";

/**
 * Pick a Drizzle driver for DATABASE_URL.
 *
 * - neon-http: Neon SQL-over-HTTP (`@neondatabase/serverless`). Required for
 *   Neon URLs unless DATABASE_DRIVER overrides it.
 * - postgres: TCP via `postgres` (postgres.js). Used for Docker Compose /
 *   local Postgres, and for Neon when DATABASE_DRIVER=postgres.
 */
export function resolveDatabaseDriver(
  databaseUrl: string,
  explicitDriver?: string | undefined,
): DatabaseDriver {
  const normalized = explicitDriver?.trim().toLowerCase();
  if (normalized === "neon-http" || normalized === "neon") {
    return "neon-http";
  }
  if (
    normalized === "postgres" ||
    normalized === "pg" ||
    normalized === "tcp"
  ) {
    return "postgres";
  }
  if (normalized) {
    throw new Error(
      `Unsupported DATABASE_DRIVER="${explicitDriver}". Use "neon-http" or "postgres".`,
    );
  }

  try {
    const host = new URL(databaseUrl).hostname;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "db" ||
      host.endsWith(".local")
    ) {
      return "postgres";
    }
    if (host.includes("neon.tech") || host.includes("neon.build")) {
      return "neon-http";
    }
  } catch {
    // Fall through to postgres for non-URL connection strings.
  }

  return "postgres";
}
