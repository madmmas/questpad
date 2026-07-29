import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProblemImageMeta } from "@/lib/problems/tagging";

function extensionFor(type: string, fallbackName: string): string {
  const fromType = type.split("/")[1];
  if (fromType) return fromType === "jpeg" ? "jpg" : fromType;
  const fromName = path.extname(fallbackName).replace(".", "");
  return fromName || "bin";
}

export async function storeProblemImage(
  file: ProblemImageMeta & { data: ArrayBuffer },
): Promise<{ url: string }> {
  const ext = extensionFor(file.type, file.name);
  const key = `problems/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(file.data);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, bytes, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url };
  }

  const uploadsDir = path.join(process.cwd(), "uploads", "problems");
  await mkdir(uploadsDir, { recursive: true });
  const filename = path.basename(key);
  await writeFile(path.join(uploadsDir, filename), bytes);
  return { url: `/api/uploads/problems/${filename}` };
}
