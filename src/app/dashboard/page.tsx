import { Dashboard } from "@/components/dashboard/dashboard";
import { buildDashboardStats } from "@/lib/dashboard/stats";
import { listBooks, listProblems } from "@/lib/problems/repository";
import { listSubmissions } from "@/lib/submissions/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [problems, books, submissions] = await Promise.all([
    listProblems(),
    listBooks(),
    listSubmissions(),
  ]);

  const stats = buildDashboardStats(problems, books, submissions);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Progress
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Your dashboard
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Track solved quests by tier, your streak, and recent activity.
        </p>
      </header>
      <Dashboard stats={stats} />
    </main>
  );
}
