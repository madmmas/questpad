import { ReviewQueue } from "@/components/review/review-queue";
import { listBooks, listProblems } from "@/lib/problems/repository";
import { buildReviewQueue } from "@/lib/submissions/review-queue";
import { listSubmissions } from "@/lib/submissions/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ParentReviewPage() {
  const [submissions, problems, books] = await Promise.all([
    listSubmissions(),
    listProblems(),
    listBooks(),
  ]);

  const items = buildReviewQueue(submissions, problems, books);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Parent review
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Review submissions
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Compare each submission against its source problem before verifying
          it.
        </p>
      </header>
      <ReviewQueue items={items} />
    </main>
  );
}
