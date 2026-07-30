import { ProblemUploadForm } from "@/components/upload/problem-upload-form";

export default function ParentUploadPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Parent</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Add quests
        </h1>
        <p className="max-w-2xl text-fg-dim">
          Scan a book page, then tag it with subject, difficulty
          (bronze/silver/gold), and the source book title.
        </p>
      </header>
      <ProblemUploadForm />
    </main>
  );
}
