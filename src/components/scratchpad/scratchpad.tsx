"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type DraftStorageAdapter,
} from "@/lib/scratchpad/draft-storage";
import {
  CANVAS_BACKGROUND,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  renderScratchpadSvg,
  strokeOutlinePath,
  type Stroke,
  type StrokePoint,
} from "@/lib/scratchpad/strokes";

const COLORS = ["#1a1d29", "#ff7a6e", "#4da3ff", "#4ade80"];
const PEN_SIZE = 4;
const ERASER_SIZE = 24;
const AUTOSAVE_DELAY_MS = 800;

function browserStorage(): DraftStorageAdapter | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function pointFromEvent(event: PointerEvent<SVGSVGElement>): StrokePoint {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    pressure: event.pressure > 0 ? event.pressure : 0.5,
    tiltX: event.tiltX ?? 0,
    tiltY: event.tiltY ?? 0,
  };
}

export function Scratchpad({
  problemId,
  referenceImageUrl,
}: {
  problemId: string;
  referenceImageUrl: string;
}) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [pencilDetected, setPencilDetected] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const storage = browserStorage();
    if (!storage) return;
    // Strokes must start empty for SSR/hydration to match; load the
    // localStorage draft only after mounting on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStrokes(loadDraft(storage, problemId));
    try {
      window.localStorage.setItem("questpad:lastProblemId", problemId);
    } catch {
      // Ignore quota / private-mode failures.
    }
  }, [problemId]);

  useEffect(() => {
    const storage = browserStorage();
    if (!storage || strokes.length === 0) return;

    const timer = setTimeout(() => {
      saveDraft(storage, problemId, strokes);
      setDraftSaved(true);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [strokes, problemId]);

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "pen") setPencilDetected(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setSubmitted(false);

    const stroke: Stroke = {
      points: [pointFromEvent(event)],
      color: tool === "eraser" ? CANVAS_BACKGROUND : color,
      size: tool === "eraser" ? ERASER_SIZE : PEN_SIZE,
    };
    setStrokes((prev) => [...prev, stroke]);
    setRedoStack([]);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!drawingRef.current) return;
    const point = pointFromEvent(event);

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const current = prev[prev.length - 1];
      const next = prev.slice(0, -1);
      next.push({ ...current, points: [...current.points, point] });
      return next;
    });
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handleUndo() {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      setRedoStack((redo) => [...redo, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  }

  function handleRedo() {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const stroke = prev[prev.length - 1];
      setStrokes((s) => [...s, stroke]);
      return prev.slice(0, -1);
    });
  }

  function handleClear() {
    setStrokes([]);
    setRedoStack([]);
  }

  function handleSaveDraft() {
    const storage = browserStorage();
    if (!storage) return;
    saveDraft(storage, problemId, strokes);
    setDraftSaved(true);
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          svgMarkup: renderScratchpadSvg(strokes),
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to submit work");
      }

      const storage = browserStorage();
      if (storage) clearDraft(storage, problemId);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit work",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-full flex-none sm:w-48">
        <p className="eyebrow mb-2">Working on</p>
        <div className="overflow-hidden rounded-[var(--radius-md)] bg-panel-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail source can be a same-origin local upload or a Vercel Blob URL, so a static remotePatterns allowlist doesn't fit here */}
          <img
            src={referenceImageUrl}
            alt=""
            className="h-36 w-full object-cover"
          />
        </div>
      </div>

      <div className="flex min-w-72 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-border bg-panel p-2">
          <button
            type="button"
            onClick={() => setTool("pen")}
            aria-pressed={tool === "pen"}
            className={`rounded-[10px] px-3 py-1.5 text-sm font-semibold ${
              tool === "pen"
                ? "bg-green text-green-ink"
                : "bg-panel-2 text-fg-dim"
            }`}
          >
            Pen
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            aria-pressed={tool === "eraser"}
            className={`rounded-[10px] px-3 py-1.5 text-sm font-semibold ${
              tool === "eraser"
                ? "bg-green text-green-ink"
                : "bg-panel-2 text-fg-dim"
            }`}
          >
            Eraser
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="btn-secondary !px-3 !py-1.5"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="btn-secondary !px-3 !py-1.5"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="btn-secondary !px-3 !py-1.5"
          >
            Clear
          </button>

          <div className="flex items-center gap-1.5 pl-1">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Color ${swatch}`}
                aria-pressed={tool === "pen" && color === swatch}
                onClick={() => {
                  setTool("pen");
                  setColor(swatch);
                }}
                style={{ backgroundColor: swatch }}
                className={`h-5 w-5 rounded-full border-2 ${
                  tool === "pen" && color === swatch
                    ? "border-fg"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>

          <span className="ml-auto text-xs text-fg-faint">
            {pencilDetected ? "Apple Pencil detected" : "Apple Pencil ready"}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="touch-none rounded-[var(--radius-lg)] border border-border"
          style={{ backgroundColor: CANVAS_BACKGROUND, minHeight: 320 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {strokes.map((stroke, index) => (
            <path
              key={index}
              d={strokeOutlinePath(stroke)}
              fill={stroke.color}
            />
          ))}
        </svg>

        <div className="flex items-center justify-end gap-2">
          {draftSaved ? (
            <span className="mr-auto text-xs text-fg-faint">Draft saved</span>
          ) : null}
          {submitError ? (
            <span className="mr-auto text-xs text-coral" role="alert">
              {submitError}
            </span>
          ) : null}
          {submitted ? (
            <span className="mr-auto text-xs text-green">Submitted!</span>
          ) : null}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || strokes.length === 0}
            className="btn-primary"
          >
            {submitting ? "Submitting…" : "Submit quest"}
          </button>
        </div>
      </div>
    </div>
  );
}
