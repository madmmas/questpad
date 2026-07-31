import { cookies } from "next/headers";
import { parseSessionToken, SESSION_COOKIE } from "./session";
import type { SessionUser } from "./types";

export type { SessionUser };

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return parseSessionToken(jar.get(SESSION_COOKIE)?.value);
}
