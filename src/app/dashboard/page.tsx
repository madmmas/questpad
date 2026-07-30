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
    <main className="flex flex-1 flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Progress</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Your dashboard
        </h1>
        <p className="max-w-2xl text-fg-dim">
          Track solved quests by tier, your streak, and recent activity.
        </p>
      </header>
      <Dashboard stats={stats} />
    </main>
  );
}
