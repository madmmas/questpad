import { NextResponse } from "next/server";
import { createAiReviewProvider } from "@/lib/ai/create-provider";
import { getAiReviewConfig } from "@/lib/ai/config";
import { loadReviewAsset } from "@/lib/ai/load-asset";
import { runAiReview } from "@/lib/ai/run-ai-review";
import { getBookById, getProblemById } from "@/lib/problems/repository";
import { submitScratchpadWork } from "@/lib/submissions/create-submission";
import { DEFAULT_CHILD_ID } from "@/lib/submissions/constants";
import {
  getSubmissionById,
  insertSubmission,
  updateSubmissionReview,
} from "@/lib/submissions/repository";
import { storeSubmissionWork } from "@/lib/storage/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      problemId?: string;
      svgMarkup?: string;
    };

    let result = await submitScratchpadWork(
      {
        problemId: String(body.problemId ?? ""),
        childId: DEFAULT_CHILD_ID,
        svgMarkup: String(body.svgMarkup ?? ""),
      },
      {
        storeWork: storeSubmissionWork,
        insertSubmission,
      },
    );

    let aiError: string | null = null;
    if (process.env.AI_REVIEW_ON_SUBMIT === "1") {
      try {
        const aiConfig = getAiReviewConfig();
        const reviewed = await runAiReview(result.id, {
          getSubmission: getSubmissionById,
          getProblem: getProblemById,
          getBook: getBookById,
          loadAsset: loadReviewAsset,
          provider: createAiReviewProvider(aiConfig),
          updateSubmissionReview,
        });
        result = reviewed.submission;
      } catch (error) {
        aiError = error instanceof Error ? error.message : "AI review failed";
      }
    }

    return NextResponse.json({ submission: result, aiError }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit work";
    const status =
      message.includes("required") || message.includes("empty") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
