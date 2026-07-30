import { NextResponse } from "next/server";
import { reviewSubmission } from "@/lib/submissions/review-submission";
import { updateSubmissionReview } from "@/lib/submissions/repository";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = (await request.json()) as {
      decision?: string;
      notes?: string;
    };

    if (body.decision !== "verified" && body.decision !== "rejected") {
      return NextResponse.json(
        { error: "decision must be 'verified' or 'rejected'" },
        { status: 400 },
      );
    }

    const result = await reviewSubmission(
      { submissionId: id, decision: body.decision, notes: body.notes },
      { updateSubmissionReview },
    );

    return NextResponse.json({ submission: result }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to review submission";
    const status = message.includes("required") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
