import { NextResponse } from "next/server";
import { createAiReviewProvider } from "@/lib/ai/create-provider";
import { getAiReviewConfig } from "@/lib/ai/config";
import { loadReviewAsset } from "@/lib/ai/load-asset";
import { runAiReview } from "@/lib/ai/run-ai-review";
import { getBookById, getProblemById } from "@/lib/problems/repository";
import {
  getSubmissionById,
  updateSubmissionReview,
} from "@/lib/submissions/repository";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const config = getAiReviewConfig();
    const result = await runAiReview(id, {
      getSubmission: getSubmissionById,
      getProblem: getProblemById,
      getBook: getBookById,
      loadAsset: loadReviewAsset,
      provider: createAiReviewProvider(config),
      updateSubmissionReview,
    });

    return NextResponse.json(
      {
        submission: result.submission,
        verdict: result.verdict,
        provider: config.provider,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run AI review";
    const status =
      message.includes("required") ||
      message.includes("not found") ||
      message.includes("Only pending") ||
      message.includes("no work") ||
      message.includes("ANTHROPIC_API_KEY") ||
      message.includes("Unsupported AI_REVIEW_PROVIDER")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
