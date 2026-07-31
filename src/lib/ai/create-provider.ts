import { createClaudeAiReviewProvider } from "./claude-provider";
import { getAiReviewConfig, type AiReviewConfig } from "./config";
import { createLocalAiReviewProvider } from "./local-provider";
import type { AiReviewProvider } from "./types";

export function createAiReviewProvider(
  config: AiReviewConfig = getAiReviewConfig(),
): AiReviewProvider {
  if (config.provider === "claude") {
    return createClaudeAiReviewProvider(config);
  }
  return createLocalAiReviewProvider();
}
