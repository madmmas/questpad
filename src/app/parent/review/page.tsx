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
    <main className="flex flex-1 flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Parent review</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Review submissions
        </h1>
        <p className="max-w-2xl text-fg-dim">
          Compare each submission against its source problem before verifying
          it.
        </p>
      </header>
      <ReviewQueue items={items} />
    </main>
  );
}
