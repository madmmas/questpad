import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseDriver } from "./driver";
import * as schema from "./schema";

export type AppDb =
  NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

let cachedDb: AppDb | null = null;
let cachedPg: ReturnType<typeof postgres> | null = null;

export function getDb(): AppDb {
  if (cachedDb) {
    return cachedDb;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const driver = resolveDatabaseDriver(url, process.env.DATABASE_DRIVER);

  if (driver === "neon-http") {
    cachedDb = drizzleNeon(neon(url), { schema });
    return cachedDb;
  }

  cachedPg = postgres(url, { max: 10 });
  cachedDb = drizzlePostgres(cachedPg, { schema });
  return cachedDb;
}

/** Test helper — clears the process-local DB singleton. */
export function resetDbClientForTests() {
  cachedDb = null;
  if (cachedPg) {
    void cachedPg.end({ timeout: 0 });
    cachedPg = null;
  }
}
