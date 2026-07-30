import type { Stroke } from "./strokes";

export type DraftStorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function draftKey(problemId: string): string {
  return `questpad:scratchpad-draft:${problemId}`;
}

export function saveDraft(
  storage: DraftStorageAdapter,
  problemId: string,
  strokes: Stroke[],
): void {
  storage.setItem(draftKey(problemId), JSON.stringify(strokes));
}

export function loadDraft(
  storage: DraftStorageAdapter,
  problemId: string,
): Stroke[] {
  const raw = storage.getItem(draftKey(problemId));
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Stroke[]) : [];
  } catch {
    return [];
  }
}

export function clearDraft(
  storage: DraftStorageAdapter,
  problemId: string,
): void {
  storage.removeItem(draftKey(problemId));
}
