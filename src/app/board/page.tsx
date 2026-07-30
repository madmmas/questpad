import { QuestBoard } from "@/components/quest-board/quest-board";
import { buildQuestBoard } from "@/lib/problems/board";
import { listBooks, listProblems } from "@/lib/problems/repository";
import { listSubmissions } from "@/lib/submissions/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [books, problems, submissions] = await Promise.all([
    listBooks(),
    listProblems(),
    listSubmissions(),
  ]);

  const groups = buildQuestBoard(books, problems, submissions);

  return (
    <main className="flex flex-1 flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Quest board</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Pick a quest
        </h1>
        <p className="max-w-2xl text-fg-dim">
          Browse quests by book. Bronze, silver, and gold show how tricky each
          one is.
        </p>
      </header>
      <QuestBoard groups={groups} />
    </main>
  );
}
