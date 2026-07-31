import { NextResponse } from "next/server";
import { authenticateDemoLogin } from "@/lib/auth/credentials";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const user = authenticateDemoLogin({
    username: String(body.username ?? ""),
    password: String(body.password ?? ""),
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const token = createSessionToken(user);
  const response = NextResponse.json({ user });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}
