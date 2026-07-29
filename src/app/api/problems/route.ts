import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createTaggedProblem } from "@/lib/problems/create-problem";
import { findOrCreateBook, insertProblem } from "@/lib/problems/repository";
import { parseTagsField } from "@/lib/problems/tagging";
import type { Difficulty } from "@/lib/problems/types";
import { storeProblemImage } from "@/lib/storage/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const bookTitle = String(form.get("bookTitle") ?? "");
    const subject = String(form.get("subject") ?? "");
    const difficulty = String(form.get("difficulty") ?? "") as Difficulty;
    const tags = parseTagsField(String(form.get("tags") ?? ""));

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    const data = await image.arrayBuffer();
    const result = await createTaggedProblem(
      {
        image: {
          name: image.name,
          type: image.type,
          size: image.size,
          data,
        },
        tags: {
          bookTitle,
          subject,
          difficulty,
          tags,
        },
      },
      {
        uploadImage: storeProblemImage,
        findOrCreateBook,
        insertProblem,
      },
    );

    return NextResponse.json(
      {
        book: result.book,
        problem: result.problem,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid tagging metadata" },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to upload problem";
    const status =
      message.includes("required") ||
      message.includes("must be") ||
      message.includes("too long")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
