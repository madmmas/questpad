import { NextResponse } from "next/server";
import { submitScratchpadWork } from "@/lib/submissions/create-submission";
import { DEFAULT_CHILD_ID } from "@/lib/submissions/constants";
import { insertSubmission } from "@/lib/submissions/repository";
import { storeSubmissionWork } from "@/lib/storage/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      problemId?: string;
      svgMarkup?: string;
    };

    const result = await submitScratchpadWork(
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

    return NextResponse.json({ submission: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit work";
    const status =
      message.includes("required") || message.includes("empty") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
