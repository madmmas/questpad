import { describe, expect, it, vi } from "vitest";
import { reviewSubmission } from "@/lib/submissions/review-submission";

describe("reviewSubmission", () => {
  it("marks a submission verified with trimmed notes", async () => {
    const updateSubmissionReview = vi.fn().mockResolvedValue({
      id: "submission-1",
      problemId: "problem-1",
      childId: "child-1",
      workImageUrl: "work.svg",
      status: "verified",
      reviewer: "parent",
      reviewNotes: "Great work!",
      submittedAt: new Date("2026-01-01"),
      reviewedAt: new Date("2026-01-01"),
    });

    const result = await reviewSubmission(
      {
        submissionId: "submission-1",
        decision: "verified",
        notes: "  Great work!  ",
      },
      { updateSubmissionReview },
    );

    expect(updateSubmissionReview).toHaveBeenCalledWith({
      id: "submission-1",
      status: "verified",
      reviewer: "parent",
      reviewNotes: "Great work!",
    });
    expect(result.status).toBe("verified");
  });

  it("marks a submission rejected with no notes as null", async () => {
    const updateSubmissionReview = vi.fn().mockResolvedValue({
      id: "submission-1",
      problemId: "problem-1",
      childId: "child-1",
      workImageUrl: "work.svg",
      status: "rejected",
      reviewer: "parent",
      reviewNotes: null,
      submittedAt: new Date("2026-01-01"),
      reviewedAt: new Date("2026-01-01"),
    });

    await reviewSubmission(
      { submissionId: "submission-1", decision: "rejected" },
      { updateSubmissionReview },
    );

    expect(updateSubmissionReview).toHaveBeenCalledWith({
      id: "submission-1",
      status: "rejected",
      reviewer: "parent",
      reviewNotes: null,
    });
  });

  it("treats whitespace-only notes as null", async () => {
    const updateSubmissionReview = vi.fn().mockResolvedValue({
      id: "submission-1",
      problemId: "problem-1",
      childId: "child-1",
      workImageUrl: "work.svg",
      status: "rejected",
      reviewer: "parent",
      reviewNotes: null,
      submittedAt: new Date("2026-01-01"),
      reviewedAt: new Date("2026-01-01"),
    });

    await reviewSubmission(
      { submissionId: "submission-1", decision: "rejected", notes: "   " },
      { updateSubmissionReview },
    );

    expect(updateSubmissionReview).toHaveBeenCalledWith({
      id: "submission-1",
      status: "rejected",
      reviewer: "parent",
      reviewNotes: null,
    });
  });

  it("rejects a missing submissionId without calling deps", async () => {
    const updateSubmissionReview = vi.fn();

    await expect(
      reviewSubmission(
        { submissionId: "", decision: "verified" },
        { updateSubmissionReview },
      ),
    ).rejects.toThrow(/submissionId is required/i);

    expect(updateSubmissionReview).not.toHaveBeenCalled();
  });
});
