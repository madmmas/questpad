import { describe, expect, it } from "vitest";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type DraftStorageAdapter,
} from "@/lib/scratchpad/draft-storage";
import {
  renderScratchpadSvg,
  strokeOutlinePath,
  type Stroke,
} from "@/lib/scratchpad/strokes";

function memoryStorage(): DraftStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
  };
}

const sampleStroke: Stroke = {
  points: [
    { x: 0, y: 0, pressure: 0.5, tiltX: 0, tiltY: 0 },
    { x: 10, y: 0, pressure: 0.5, tiltX: 0, tiltY: 0 },
    { x: 10, y: 10, pressure: 0.8, tiltX: 10, tiltY: 5 },
  ],
  color: "#1a1d29",
  size: 4,
};

describe("strokeOutlinePath", () => {
  it("returns an empty string for a stroke with no points", () => {
    expect(strokeOutlinePath({ points: [], color: "#000", size: 4 })).toBe("");
  });

  it("produces a closed SVG path for a stroke with points", () => {
    const path = strokeOutlinePath(sampleStroke);
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
  });
});

describe("renderScratchpadSvg", () => {
  it("renders an svg with just the background rect when there are no strokes", () => {
    const svg = renderScratchpadSvg([]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect");
    expect(svg).not.toContain("<path");
  });

  it("renders a path per non-empty stroke", () => {
    const svg = renderScratchpadSvg([sampleStroke]);
    expect(svg).toContain("<path");
    expect(svg).toContain(sampleStroke.color);
  });
});

describe("draft storage", () => {
  it("round-trips strokes through save/load", () => {
    const storage = memoryStorage();
    saveDraft(storage, "problem-1", [sampleStroke]);

    expect(loadDraft(storage, "problem-1")).toEqual([sampleStroke]);
  });

  it("keeps drafts for different problems separate", () => {
    const storage = memoryStorage();
    saveDraft(storage, "problem-1", [sampleStroke]);

    expect(loadDraft(storage, "problem-2")).toEqual([]);
  });

  it("returns an empty array when nothing is saved", () => {
    const storage = memoryStorage();
    expect(loadDraft(storage, "problem-1")).toEqual([]);
  });

  it("returns an empty array for corrupt JSON instead of throwing", () => {
    const storage = memoryStorage();
    storage.setItem("questpad:scratchpad-draft:problem-1", "not json");

    expect(loadDraft(storage, "problem-1")).toEqual([]);
  });

  it("clears a saved draft", () => {
    const storage = memoryStorage();
    saveDraft(storage, "problem-1", [sampleStroke]);
    clearDraft(storage, "problem-1");

    expect(loadDraft(storage, "problem-1")).toEqual([]);
  });
});
