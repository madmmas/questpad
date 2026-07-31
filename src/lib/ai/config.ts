export type AiReviewProviderName = "local" | "claude";

export type AiReviewConfig = {
  provider: AiReviewProviderName;
  apiKey: string;
  model: string;
  /** When true, child submit triggers AI review after insert. */
  onSubmit: boolean;
};

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514";

/**
 * Resolve AI review settings from environment variables.
 *
 * - `AI_REVIEW_PROVIDER=local|claude` forces a provider.
 * - Unset / `auto`: Claude when `ANTHROPIC_API_KEY` is set, otherwise local.
 * Secrets (`ANTHROPIC_API_KEY`) must come from env — never hardcode.
 */
export function getAiReviewConfig(
  env: Record<string, string | undefined> = process.env,
): AiReviewConfig {
  const raw = env.AI_REVIEW_PROVIDER?.trim().toLowerCase();
  const apiKey = env.ANTHROPIC_API_KEY?.trim() ?? "";
  const model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
  const onSubmit = env.AI_REVIEW_ON_SUBMIT === "1";

  let provider: AiReviewProviderName;
  if (raw === "local" || raw === "claude") {
    provider = raw;
  } else if (!raw || raw === "auto") {
    provider = apiKey ? "claude" : "local";
  } else {
    throw new Error(
      `Unsupported AI_REVIEW_PROVIDER="${env.AI_REVIEW_PROVIDER}". Use local, claude, or auto.`,
    );
  }

  if (provider === "claude" && !apiKey) {
    throw new Error(
      "AI_REVIEW_PROVIDER=claude requires ANTHROPIC_API_KEY to be set.",
    );
  }

  return { provider, apiKey, model, onSubmit };
}
