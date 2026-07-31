import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role, SessionUser } from "./types";
import { isRole } from "./types";

export const SESSION_COOKIE = "questpad_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = SessionUser & { exp: number };

function authSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "questpad-dev-auth-secret"
  );
}

function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<SessionPayload>;
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.role !== "string" ||
      !isRole(parsed.role) ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return {
      username: parsed.username,
      role: parsed.role,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = encodePayload(payload);
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(
  token: string | undefined | null,
): SessionUser | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  const payload = decodePayload(body);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { username: payload.username, role: payload.role };
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

/** Pure route access rules used by proxy and unit tests. */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return true;
  }

  if (!role) {
    return false;
  }

  if (pathname.startsWith("/parent")) {
    return role === "parent";
  }

  if (pathname.startsWith("/child")) {
    return role === "child";
  }

  // Shared app surfaces
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/board" ||
    pathname.startsWith("/quest/")
  ) {
    return true;
  }

  // API: parent mutations
  if (
    pathname === "/api/problems" ||
    pathname.startsWith("/api/submissions/")
  ) {
    // GET list / uploads are shared; method checked in route handlers / proxy for writes
    return true;
  }

  if (pathname.startsWith("/api/uploads/")) {
    return true;
  }

  if (pathname === "/api/submissions") {
    return true;
  }

  return false;
}

export function defaultHomeForRole(role: Role): string {
  void role;
  return "/dashboard";
}
