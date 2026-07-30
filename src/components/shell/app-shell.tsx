"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Progress" },
  { href: "/board", label: "Quest board" },
  { href: "/parent/review", label: "Review" },
  { href: "/parent/upload", label: "Add quests" },
] as const;

function tabActive(pathname: string, href: string) {
  if (href === "/board") {
    return pathname === "/board" || pathname.startsWith("/quest/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col px-6 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-[26px] font-extrabold tracking-wide text-fg"
        >
          <span
            aria-hidden
            className="inline-block h-3.5 w-3.5 rotate-45 rounded-[4px] bg-green"
          />
          QuestPad
        </Link>

        <div className="flex items-center gap-3.5">
          <div className="flex min-w-[150px] flex-col gap-1.5">
            <div className="text-sm font-semibold">Explorer</div>
            <div className="flex items-center gap-2">
              <span className="font-display whitespace-nowrap rounded-lg bg-gold px-2 py-0.5 text-[11px] font-bold text-bg">
                LVL 12
              </span>
              <div className="h-2 min-w-20 flex-1 overflow-hidden rounded-md bg-panel-2">
                <div
                  className="h-full rounded-md"
                  style={{
                    width: "64%",
                    background:
                      "linear-gradient(90deg, var(--green), var(--blue))",
                  }}
                />
              </div>
              <span className="whitespace-nowrap text-[11px] text-fg-faint">
                640 / 1000 XP
              </span>
            </div>
          </div>
          <div
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-panel-2 font-display text-lg font-extrabold text-bg"
            style={{
              background: "linear-gradient(160deg, var(--purple), var(--blue))",
            }}
          >
            E
          </div>
        </div>
      </header>

      <nav aria-label="Primary" className="mb-5 flex flex-wrap gap-2">
        {NAV.map((item) => {
          const active = tabActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
