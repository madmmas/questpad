"use client";

import { useState, type FormEvent } from "react";
import { DIFFICULTIES, type Difficulty } from "@/lib/problems/types";

type UploadResult = {
  problem: { id: string; imageUrl: string; difficulty: string };
  book: { id: string; title: string; subject: string | null };
};

export function ProblemUploadForm() {
  const [bookTitle, setBookTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("bronze");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!image) {
      setError("Choose a scanned page image to upload.");
      return;
    }

    const body = new FormData();
    body.set("image", image);
    body.set("bookTitle", bookTitle);
    body.set("subject", subject);
    body.set("difficulty", difficulty);
    body.set("tags", tags);

    setPending(true);
    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as
        UploadResult | { error?: string };

      if (!response.ok) {
        setError(
          "error" in payload && payload.error ? payload.error : "Upload failed",
        );
        return;
      }

      setResult(payload as UploadResult);
      setImage(null);
      setTags("");
    } catch {
      setError("Network error while uploading.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Scanned page image</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Source book / title</span>
        <input
          value={bookTitle}
          onChange={(event) => setBookTitle(event.target.value)}
          placeholder="Math Workbook"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Subject</span>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Math"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Difficulty</span>
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {DIFFICULTIES.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Tags (optional, comma-separated)</span>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="fractions, word-problems"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Uploading…" : "Upload problem"}
      </button>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm dark:border-emerald-800 dark:bg-emerald-950">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">
            Problem uploaded
          </p>
          <p className="mt-1 text-emerald-900 dark:text-emerald-100">
            {result.book.title} · {result.book.subject} ·{" "}
            {result.problem.difficulty}
          </p>
          <p className="mt-1 break-all text-emerald-800/80 dark:text-emerald-200/80">
            id: {result.problem.id}
          </p>
        </div>
      ) : null}
    </form>
  );
}
