import { describe, expect, it } from "vitest";
import { resolveDatabaseDriver } from "@/lib/db/driver";

describe("resolveDatabaseDriver", () => {
  it("uses neon-http for Neon hosts by default", () => {
    expect(
      resolveDatabaseDriver(
        "postgresql://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb",
      ),
    ).toBe("neon-http");
  });

  it("uses postgres for localhost and compose db host", () => {
    expect(
      resolveDatabaseDriver(
        "postgresql://questpad:questpad@localhost:5432/questpad",
      ),
    ).toBe("postgres");
    expect(
      resolveDatabaseDriver("postgresql://questpad:questpad@db:5432/questpad"),
    ).toBe("postgres");
    expect(
      resolveDatabaseDriver(
        "postgresql://questpad:questpad@127.0.0.1:5432/questpad",
      ),
    ).toBe("postgres");
  });

  it("honors DATABASE_DRIVER overrides", () => {
    expect(
      resolveDatabaseDriver(
        "postgresql://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb",
        "postgres",
      ),
    ).toBe("postgres");
    expect(
      resolveDatabaseDriver(
        "postgresql://questpad:questpad@localhost:5432/questpad",
        "neon-http",
      ),
    ).toBe("neon-http");
    expect(
      resolveDatabaseDriver(
        "postgresql://questpad:questpad@localhost:5432/questpad",
        "neon",
      ),
    ).toBe("neon-http");
  });

  it("rejects unknown drivers", () => {
    expect(() =>
      resolveDatabaseDriver("postgresql://localhost:5432/questpad", "sqlite"),
    ).toThrow(/Unsupported DATABASE_DRIVER/);
  });
});
