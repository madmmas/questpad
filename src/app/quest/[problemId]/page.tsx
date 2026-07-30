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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          {book?.title ?? "Quest"}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Work it out</h1>
      </header>
      <Scratchpad problemId={problem.id} referenceImageUrl={problem.imageUrl} />
    </main>
  );
}
