import { describe, expect, it } from "vitest";
import { authenticateDemoLogin } from "@/lib/auth/credentials";
import {
  canAccessPath,
  createSessionToken,
  parseSessionToken,
} from "@/lib/auth/session";

describe("authenticateDemoLogin", () => {
  it("accepts the demo parent account", () => {
    expect(
      authenticateDemoLogin({
        username: "parent",
        password: "parent123",
        role: "parent",
      }),
    ).toEqual({ username: "parent", role: "parent" });
  });

  it("rejects wrong role even with matching username/password", () => {
    expect(
      authenticateDemoLogin({
        username: "parent",
        password: "parent123",
        role: "child",
      }),
    ).toBeNull();
  });

  it("rejects bad passwords", () => {
    expect(
      authenticateDemoLogin({
        username: "child",
        password: "nope",
        role: "child",
      }),
    ).toBeNull();
  });
});

describe("session token", () => {
  it("round-trips a signed session", () => {
    const token = createSessionToken({ username: "child", role: "child" });
    expect(parseSessionToken(token)).toEqual({
      username: "child",
      role: "child",
    });
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken({ username: "parent", role: "parent" });
    expect(parseSessionToken(`${token}x`)).toBeNull();
  });
});

describe("canAccessPath", () => {
  it("allows login without a session", () => {
    expect(canAccessPath(null, "/login")).toBe(true);
  });

  it("blocks app pages without a session", () => {
    expect(canAccessPath(null, "/dashboard")).toBe(false);
  });

  it("keeps parent routes parent-only", () => {
    expect(canAccessPath("parent", "/parent/upload")).toBe(true);
    expect(canAccessPath("child", "/parent/upload")).toBe(false);
  });

  it("keeps child review child-only", () => {
    expect(canAccessPath("child", "/child/review")).toBe(true);
    expect(canAccessPath("parent", "/child/review")).toBe(false);
  });

  it("allows shared board and dashboard for both roles", () => {
    expect(canAccessPath("parent", "/board")).toBe(true);
    expect(canAccessPath("child", "/dashboard")).toBe(true);
  });
});
