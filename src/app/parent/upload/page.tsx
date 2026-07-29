import { ProblemUploadForm } from "@/components/upload/problem-upload-form";

export default function ParentUploadPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Parent
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Upload a problem
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Scan a book page, then tag it with subject, difficulty
          (bronze/silver/gold), and the source book title.
        </p>
      </header>
      <ProblemUploadForm />
    </main>
  );
}
