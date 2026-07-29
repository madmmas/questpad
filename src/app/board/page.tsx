import { QuestBoard } from "@/components/quest-board/quest-board";
import { buildQuestBoard } from "@/lib/problems/board";
import { listBooks, listProblems } from "@/lib/problems/repository";
import { listSubmissions } from "@/lib/submissions/repository";

export const runtime = "nodejs";

export default async function BoardPage() {
  const [books, problems, submissions] = await Promise.all([
    listBooks(),
    listProblems(),
    listSubmissions(),
  ]);

  const groups = buildQuestBoard(books, problems, submissions);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Quest board
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Pick a quest</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Browse quests by book. Bronze, silver, and gold show how tricky each
          one is.
        </p>
      </header>
      <QuestBoard groups={groups} />
    </main>
  );
}
