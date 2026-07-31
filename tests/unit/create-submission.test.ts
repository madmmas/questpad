import { describe, expect, it, vi } from "vitest";
import { submitScratchpadWork } from "@/lib/submissions/create-submission";

describe("submitScratchpadWork", () => {
  it("uploads the rendered svg and persists a pending submission", async () => {
    const storeWork = vi.fn().mockResolvedValue({
      url: "https://blob.example/submissions/work.svg",
    });
    const insertSubmission = vi.fn().mockResolvedValue({
      id: "submission-1",
      problemId: "problem-1",
      childId: "child-1",
      workImageUrl: "https://blob.example/submissions/work.svg",
      status: "pending",
      reviewer: null,
      reviewNotes: null,
      submittedAt: new Date("2026-01-01"),
      reviewedAt: null,
    });

    const result = await submitScratchpadWork(
      {
        problemId: "problem-1",
        childId: "child-1",
        svgMarkup: "<svg></svg>",
      },
      { storeWork, insertSubmission },
    );

    expect(storeWork).toHaveBeenCalledWith("<svg></svg>");
    expect(insertSubmission).toHaveBeenCalledWith({
      problemId: "problem-1",
      childId: "child-1",
      workImageUrl: "https://blob.example/submissions/work.svg",
    });
    expect(result.id).toBe("submission-1");
  });

  it("rejects an empty problemId without calling deps", async () => {
    const storeWork = vi.fn();
    const insertSubmission = vi.fn();

    await expect(
      submitScratchpadWork(
        { problemId: "", childId: "child-1", svgMarkup: "<svg></svg>" },
        { storeWork, insertSubmission },
      ),
    ).rejects.toThrow(/problemId is required/i);

    expect(storeWork).not.toHaveBeenCalled();
    expect(insertSubmission).not.toHaveBeenCalled();
  });

  it("rejects empty scratchpad work without calling deps", async () => {
    const storeWork = vi.fn();
    const insertSubmission = vi.fn();

    await expect(
      submitScratchpadWork(
        { problemId: "problem-1", childId: "child-1", svgMarkup: "   " },
        { storeWork, insertSubmission },
      ),
    ).rejects.toThrow(/scratchpad work is empty/i);

    expect(storeWork).not.toHaveBeenCalled();
    expect(insertSubmission).not.toHaveBeenCalled();
  });
});
