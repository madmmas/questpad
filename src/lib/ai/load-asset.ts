import { readFile } from "node:fs/promises";
import path from "node:path";

export type LoadedReviewAsset = {
  url: string;
  mediaType: string;
  bytes: Buffer;
  text?: string;
};

function mediaTypeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function resolveLocalPath(urlPath: string): string | null {
  if (urlPath.startsWith("/mock-data/")) {
    return path.join(process.cwd(), "public", urlPath.slice(1));
  }
  if (urlPath.startsWith("/api/uploads/problems/")) {
    const filename = path.basename(urlPath);
    return path.join(process.cwd(), "uploads", "problems", filename);
  }
  if (urlPath.startsWith("/api/uploads/submissions/")) {
    const filename = path.basename(urlPath);
    return path.join(process.cwd(), "uploads", "submissions", filename);
  }
  return null;
}

/**
 * Load a problem/work image for AI review from a public URL, app-relative
 * path under `public/` / `uploads/`, or remote Blob URL.
 */
export async function loadReviewAsset(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<LoadedReviewAsset> {
  if (!url?.trim()) {
    throw new Error("Image URL is required for AI review");
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const response = await fetchImpl(trimmed);
    if (!response.ok) {
      throw new Error(`Failed to fetch image (${response.status}): ${trimmed}`);
    }
    const mediaType =
      response.headers.get("content-type")?.split(";")[0]?.trim() ||
      "application/octet-stream";
    const bytes = Buffer.from(await response.arrayBuffer());
    const text =
      mediaType.includes("svg") || mediaType.startsWith("text/")
        ? bytes.toString("utf8")
        : undefined;
    return { url: trimmed, mediaType, bytes, text };
  }

  const pathname = trimmed.startsWith("/")
    ? trimmed
    : new URL(trimmed, "http://localhost").pathname;
  const localPath = resolveLocalPath(pathname);
  if (!localPath) {
    throw new Error(`Unsupported image URL for AI review: ${trimmed}`);
  }

  const bytes = await readFile(localPath);
  const mediaType = mediaTypeFromPath(localPath);
  const text =
    mediaType.includes("svg") || mediaType.startsWith("text/")
      ? bytes.toString("utf8")
      : undefined;
  return { url: trimmed, mediaType, bytes, text };
}
