import { notFound } from "next/navigation";
import { Scratchpad } from "@/components/scratchpad/scratchpad";
import { getBookById, getProblemById } from "@/lib/problems/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ problemId: string }>;
};

export default async function QuestPage({ params }: PageProps) {
  const { problemId } = await params;
  const problem = await getProblemById(problemId);
  if (!problem) notFound();

  const book = await getBookById(problem.bookId);

  return (
    <main className="flex flex-1 flex-col gap-6 py-2">
      <header className="flex flex-col gap-1">
        <p className="eyebrow">{book?.title ?? "Quest"}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Work it out
        </h1>
      </header>
      <Scratchpad problemId={problem.id} referenceImageUrl={problem.imageUrl} />
    </main>
  );
}
