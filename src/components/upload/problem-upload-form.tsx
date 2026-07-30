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
    <form
      onSubmit={onSubmit}
      className="card flex w-full max-w-xl flex-col gap-5"
    >
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Scanned page image</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
          className="field"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Source book / title</span>
        <input
          value={bookTitle}
          onChange={(event) => setBookTitle(event.target.value)}
          placeholder="Math Workbook"
          className="field"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Subject</span>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Math"
          className="field"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Difficulty</span>
        <select
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as Difficulty)}
          className="field"
        >
          {DIFFICULTIES.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold">Tags (optional, comma-separated)</span>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="fractions, word-problems"
          className="field"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Uploading…" : "Upload problem"}
      </button>

      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-[var(--radius-md)] border border-green/40 bg-green/10 p-4 text-sm">
          <p className="font-semibold text-green">Problem uploaded</p>
          <p className="mt-1 text-fg">
            {result.book.title} · {result.book.subject} ·{" "}
            {result.problem.difficulty}
          </p>
          <p className="mt-1 break-all text-fg-dim">id: {result.problem.id}</p>
        </div>
      ) : null}
    </form>
  );
}
