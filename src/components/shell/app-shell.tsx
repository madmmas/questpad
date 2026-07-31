"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { Role, SessionUser } from "@/lib/auth/types";

type NavItem = {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
};

const PARENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Quest Board" },
  { href: "/parent/review", label: "Submit Review" },
  { href: "/parent/upload", label: "Add Quest" },
];

const CHILD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Quest Board" },
  { href: "/board", label: "Start Quest", match: () => false },
  {
    href: "/board",
    label: "Scratchpad",
    match: (pathname) => pathname.startsWith("/quest/"),
  },
  { href: "/child/review", label: "Review" },
];

function navForRole(role: Role): NavItem[] {
  return role === "parent" ? PARENT_NAV : CHILD_NAV;
}

function tabActive(pathname: string, item: NavItem) {
  if (item.match) {
    return item.match(pathname);
  }
  if (item.href === "/board") {
    return pathname === "/board";
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function initialFromUsername(username: string) {
  return username.trim().charAt(0).toUpperCase() || "?";
}

function readScratchpadHref(): string {
  try {
    const last = window.localStorage.getItem("questpad:lastProblemId");
    return last ? `/quest/${last}` : "/board";
  } catch {
    return "/board";
  }
}

function useScratchpadHref() {
  return useSyncExternalStore(
    () => () => {},
    readScratchpadHref,
    () => "/board",
  );
}

export function AppShell({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: SessionUser | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const scratchpadHref = useScratchpadHref();
  const session = initialSession;
  const isLogin = pathname === "/login";

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (isLogin) {
    return <>{children}</>;
  }

  const nav = session ? navForRole(session.role) : [];

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col px-6 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={session ? "/dashboard" : "/login"}
          className="font-display flex items-center gap-2 text-[26px] font-extrabold tracking-wide text-fg"
        >
          <span
            aria-hidden
            className="inline-block h-3.5 w-3.5 rotate-45 rounded-[4px] bg-green"
          />
          QuestPad
        </Link>

        {session ? (
          <div className="flex items-center gap-3.5">
            <div className="flex min-w-[150px] flex-col gap-1.5">
              <div className="text-sm font-semibold capitalize">
                {session.username}{" "}
                <span className="text-fg-faint">({session.role})</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="w-fit text-left text-[11px] font-semibold text-fg-dim hover:text-fg"
              >
                Sign out
              </button>
            </div>
            <div
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-panel-2 font-display text-lg font-extrabold text-bg"
              style={{
                background:
                  "linear-gradient(160deg, var(--purple), var(--blue))",
              }}
            >
              {initialFromUsername(session.username)}
            </div>
          </div>
        ) : null}
      </header>

      {session ? (
        <nav aria-label="Primary" className="mb-5 flex flex-wrap gap-2">
          {nav.map((item) => {
            const href =
              item.label === "Scratchpad" ? scratchpadHref : item.href;
            const active = tabActive(pathname, item);
            return (
              <Link
                key={`${item.label}-${href}`}
                href={href}
                className={`rounded-[10px] border px-[18px] py-2 text-sm font-semibold ${
                  active
                    ? "border-green bg-green text-green-ink"
                    : "border-border bg-panel text-fg-dim hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
