import type { AiReviewInput, AiReviewProvider, AiReviewVerdict } from "./types";

/**
 * Deterministic local reviewer for demos / offline use (no API key).
 * Verifies when the work asset has non-trivial content; otherwise rejects.
 */
export function createLocalAiReviewProvider(): AiReviewProvider {
  return {
    async review(input: AiReviewInput): Promise<AiReviewVerdict> {
      const workBytes = input.workImage.bytes.length;
      const workText = input.workImage.text?.trim().length ?? 0;
      const hasWork = workBytes > 64 || workText > 32;

      if (!hasWork) {
        return {
          decision: "rejected",
          notes:
            "[local AI] No substantial work found on the scratchpad. Try again and submit when finished.",
          provider: "local",
        };
      }

      const difficulty = input.difficulty ?? "unknown";
      return {
        decision: "verified",
        notes: `[local AI] Looks complete for a ${difficulty} quest${
          input.bookTitle ? ` from “${input.bookTitle}”` : ""
        }. Parent can still re-check if needed.`,
        provider: "local",
      };
    },
  };
}
