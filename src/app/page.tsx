import Link from "next/link";

const destinations = [
  {
    href: "/board",
    label: "Quest board",
    description: "Browse and pick a quest to solve.",
  },
  {
    href: "/parent/upload",
    label: "Add quests",
    description: "Parent: scan a book page and tag it as a quest.",
  },
  {
    href: "/parent/review",
    label: "Review",
    description: "Parent: verify or reject pending submissions.",
  },
  {
    href: "/dashboard",
    label: "Progress",
    description: "Streak, solved quests, heatmap, and badges.",
  },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-10 py-4">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Welcome</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Family learning tracker
        </h1>
        <p className="max-w-2xl text-lg text-fg-dim">
          Parents upload scanned book pages as quests. Kids solve them on a
          scratchpad. Progress shows up on a gamified dashboard.
        </p>
      </header>

      <nav aria-label="Shortcuts" className="grid gap-4 sm:grid-cols-2">
        {destinations.map((item) => (
          <Link
            key={item.href}
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
