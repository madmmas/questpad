import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { filename } = await params;
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "submissions",
    filename,
  );

  try {
    const data = await readFile(filePath);

    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
