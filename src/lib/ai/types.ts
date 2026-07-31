export type ReviewDecision = "verified" | "rejected";

export type ReviewImage = {
  /** Public or app-relative URL used for logging / local heuristics. */
  url: string;
  mediaType: string;
  /** Raw bytes (for Claude vision) or empty when only text is available. */
  bytes: Buffer;
  /** UTF-8 text when the asset is SVG/markup rather than a raster image. */
  text?: string;
};

export type AiReviewInput = {
  submissionId: string;
  problemImage: ReviewImage;
  workImage: ReviewImage;
  bookTitle?: string;
  difficulty?: string;
};

export type AiReviewVerdict = {
  decision: ReviewDecision;
  notes: string;
  provider: "local" | "claude";
};

export type AiReviewProvider = {
  review(input: AiReviewInput): Promise<AiReviewVerdict>;
};
