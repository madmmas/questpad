import Link from "next/link";

const destinations = [
  {
    href: "/board",
    label: "Quest board",
    description: "Browse and pick a quest to solve.",
  },
  {
    href: "/parent/upload",
    label: "Upload a problem",
    description: "Parent: scan a book page and tag it as a quest.",
  },
  {
    href: "/parent/review",
    label: "Review queue",
    description: "Parent: verify or reject pending submissions.",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Streak, solved quests, heatmap, and badges.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          QuestPad
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Family learning tracker
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Parents upload scanned book pages as quests. Kids solve them on a
          scratchpad. Progress shows up on a gamified dashboard.
        </p>
      </header>

      <nav aria-label="Main" className="grid gap-4 sm:grid-cols-2">
        {destinations.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col gap-1 border border-zinc-200 px-5 py-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-500"
          >
            <span className="text-lg font-medium tracking-tight">
              {item.label}
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.description}
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
