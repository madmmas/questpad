import { describe, expect, it, vi } from "vitest";
import { getAiReviewConfig } from "@/lib/ai/config";
import { createLocalAiReviewProvider } from "@/lib/ai/local-provider";
import { runAiReview } from "@/lib/ai/run-ai-review";
import type { ReviewImage } from "@/lib/ai/types";

describe("getAiReviewConfig", () => {
  it("defaults to local when no provider or API key is set", () => {
    expect(getAiReviewConfig({}).provider).toBe("local");
  });

  it("auto-selects claude when ANTHROPIC_API_KEY is set", () => {
    const config = getAiReviewConfig({
      ANTHROPIC_API_KEY: "sk-test",
    });
    expect(config.provider).toBe("claude");
    expect(config.apiKey).toBe("sk-test");
  });

  it("forces local even when a key is present", () => {
    expect(
      getAiReviewConfig({
        AI_REVIEW_PROVIDER: "local",
        ANTHROPIC_API_KEY: "sk-test",
      }).provider,
    ).toBe("local");
  });

  it("requires ANTHROPIC_API_KEY for claude provider", () => {
    expect(() => getAiReviewConfig({ AI_REVIEW_PROVIDER: "claude" })).toThrow(
      /ANTHROPIC_API_KEY/,
    );
  });

  it("reads model and on-submit flag from env", () => {
    const config = getAiReviewConfig({
      AI_REVIEW_PROVIDER: "local",
      ANTHROPIC_MODEL: "claude-test-model",
      AI_REVIEW_ON_SUBMIT: "1",
    });
    expect(config.model).toBe("claude-test-model");
    expect(config.onSubmit).toBe(true);
  });
});

describe("createLocalAiReviewProvider", () => {
  it("verifies when work content is present", async () => {
    const provider = createLocalAiReviewProvider();
    const workImage: ReviewImage = {
      url: "/work.svg",
      mediaType: "image/svg+xml",
      bytes: Buffer.from("<svg>lots of drawing content here</svg>"),
      text: "<svg>lots of drawing content here</svg>",
    };
    const verdict = await provider.review({
      submissionId: "s1",
      problemImage: {
        url: "/problem.svg",
        mediaType: "image/svg+xml",
        bytes: Buffer.from("<svg/>"),
      },
      workImage,
      difficulty: "bronze",
      bookTitle: "Math Workbook",
    });
    expect(verdict.decision).toBe("verified");
    expect(verdict.provider).toBe("local");
    expect(verdict.notes).toMatch(/local AI/i);
  });

  it("rejects empty work", async () => {
    const provider = createLocalAiReviewProvider();
    const verdict = await provider.review({
      submissionId: "s1",
      problemImage: {
        url: "/problem.svg",
        mediaType: "image/svg+xml",
        bytes: Buffer.from("<svg/>"),
      },
      workImage: {
        url: "/work.svg",
        mediaType: "image/svg+xml",
        bytes: Buffer.from(""),
        text: "",
      },
    });
    expect(verdict.decision).toBe("rejected");
  });
});

describe("runAiReview", () => {
  it("loads assets, calls provider, and persists reviewer=ai", async () => {
    const updateSubmissionReview = vi.fn().mockResolvedValue({
      id: "sub-1",
      problemId: "prob-1",
      childId: "child-1",
      workImageUrl: "/work.svg",
      status: "verified",
      reviewer: "ai",
      reviewNotes: "ok",
      submittedAt: new Date("2026-01-01"),
      reviewedAt: new Date("2026-01-02"),
    });

    const result = await runAiReview("sub-1", {
      getSubmission: vi.fn().mockResolvedValue({
        id: "sub-1",
        problemId: "prob-1",
        childId: "child-1",
        workImageUrl: "/work.svg",
        status: "pending",
        reviewer: null,
        reviewNotes: null,
        submittedAt: new Date("2026-01-01"),
        reviewedAt: null,
      }),
      getProblem: vi.fn().mockResolvedValue({
        id: "prob-1",
        bookId: "book-1",
        imageUrl: "/problem.svg",
        difficulty: "silver",
        tags: null,
      }),
      getBook: vi.fn().mockResolvedValue({
        id: "book-1",
        title: "Science Practice",
        subject: "Science",
      }),
      loadAsset: vi.fn(async (url: string) => ({
        url,
        mediaType: "image/svg+xml",
        bytes: Buffer.from("<svg>content</svg>"),
        text: "<svg>content</svg>",
      })),
      provider: {
        review: vi.fn().mockResolvedValue({
          decision: "verified",
          notes: "  ok  ",
          provider: "local",
        }),
      },
      updateSubmissionReview,
    });

    expect(updateSubmissionReview).toHaveBeenCalledWith({
      id: "sub-1",
      status: "verified",
      reviewer: "ai",
      reviewNotes: "ok",
    });
    expect(result.verdict.decision).toBe("verified");
  });

  it("refuses non-pending submissions", async () => {
    await expect(
      runAiReview("sub-1", {
        getSubmission: vi.fn().mockResolvedValue({
          id: "sub-1",
          problemId: "prob-1",
          childId: "child-1",
          workImageUrl: "/work.svg",
          status: "verified",
          reviewer: "parent",
          reviewNotes: null,
          submittedAt: new Date(),
          reviewedAt: new Date(),
        }),
        getProblem: vi.fn(),
        getBook: vi.fn(),
        loadAsset: vi.fn(),
        provider: { review: vi.fn() },
        updateSubmissionReview: vi.fn(),
      }),
    ).rejects.toThrow(/Only pending/);
  });
});
