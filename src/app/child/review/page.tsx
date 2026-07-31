import { ChildReviewFeed } from "@/components/review/child-review-feed";
import { listBooks, listProblems } from "@/lib/problems/repository";
import { buildChildReviewFeed } from "@/lib/submissions/child-review";
import { listSubmissions } from "@/lib/submissions/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ChildReviewPage() {
  const [submissions, problems, books] = await Promise.all([
    listSubmissions(),
    listProblems(),
    listBooks(),
  ]);

  const items = buildChildReviewFeed(submissions, problems, books);

  return (
    <main className="flex flex-1 flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Child</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Your reviews
        </h1>
        <p className="max-w-2xl text-fg-dim">
          See whether each quest was verified or needs revision, plus any notes
          from your parent.
        </p>
      </header>
      <ChildReviewFeed items={items} />
    </main>
  );
}
