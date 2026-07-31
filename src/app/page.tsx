import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";

const PARENT_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Track solved quests, streak, and badges.",
  },
  {
    href: "/board",
    label: "Quest Board",
    description: "Browse quests by book and difficulty.",
  },
  {
    href: "/parent/review",
    label: "Submit Review",
    description: "Verify or reject pending submissions.",
  },
  {
    href: "/parent/upload",
    label: "Add Quest",
    description: "Upload a scanned book page as a quest.",
  },
] as const;

const CHILD_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "See your streak, heatmap, and badges.",
  },
  {
    href: "/board",
    label: "Quest Board",
    description: "Browse quests by book and difficulty.",
  },
  {
    href: "/board",
    label: "Start Quest",
    description: "Pick a quest and open the scratchpad.",
  },
  {
    href: "/child/review",
    label: "Review",
    description: "Read parent feedback on your submissions.",
  },
] as const;

export default async function Home() {
  const session = await getSession();
  const links = session?.role === "parent" ? PARENT_LINKS : CHILD_LINKS;

  return (
    <main className="flex flex-1 flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Welcome</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Family learning tracker
        </h1>
        <p className="max-w-2xl text-lg text-fg-dim">
          Signed in as <strong className="text-fg">{session?.username}</strong>{" "}
          ({session?.role}). Use the tabs above or jump to a destination below.
        </p>
      </header>

      <nav aria-label="Shortcuts" className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            className="card flex flex-col gap-1 transition-colors hover:border-green/40"
          >
            <span className="font-display text-lg font-bold tracking-tight">
              {item.label}
            </span>
            <span className="text-sm text-fg-dim">{item.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
