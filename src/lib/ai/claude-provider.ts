import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AiReviewConfig } from "./config";
import type {
  AiReviewInput,
  AiReviewProvider,
  AiReviewVerdict,
  ReviewImage,
} from "./types";

const verdictSchema = z.object({
  decision: z.enum(["verified", "rejected"]),
  notes: z.string().trim().min(1).max(2000),
});

const RASTER_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function anthropicImageBlock(image: ReviewImage) {
  if (!RASTER_TYPES.has(image.mediaType) || image.bytes.length === 0) {
    return null;
  }
  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: image.mediaType as
        "image/jpeg" | "image/png" | "image/gif" | "image/webp",
      data: image.bytes.toString("base64"),
    },
  };
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude response did not include a JSON object");
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

export function createClaudeAiReviewProvider(
  config: Pick<AiReviewConfig, "apiKey" | "model">,
  client: Anthropic = new Anthropic({ apiKey: config.apiKey }),
): AiReviewProvider {
  return {
    async review(input: AiReviewInput): Promise<AiReviewVerdict> {
      const problemImage = anthropicImageBlock(input.problemImage);
      const workImage = anthropicImageBlock(input.workImage);

      const content: Anthropic.MessageCreateParams["messages"][0]["content"] =
        [];

      content.push({
        type: "text",
        text: [
          "You are reviewing a child's homework submission for QuestPad.",
          "Compare the submitted work against the source problem page.",
          "Grade generously for young learners: verify if the work shows a reasonable attempt that appears correct;",
          "reject only when work is missing, blank, or clearly wrong.",
          'Respond with ONLY JSON: {"decision":"verified"|"rejected","notes":"short feedback for the child"}.',
          input.bookTitle ? `Book: ${input.bookTitle}` : null,
          input.difficulty ? `Difficulty: ${input.difficulty}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      });

      content.push({ type: "text", text: "Source problem:" });
      if (problemImage) {
        content.push(problemImage);
      } else if (input.problemImage.text) {
        content.push({
          type: "text",
          text: input.problemImage.text.slice(0, 20_000),
        });
      } else {
        content.push({
          type: "text",
          text: `(problem image unavailable; url=${input.problemImage.url})`,
        });
      }

      content.push({ type: "text", text: "Child's submitted work:" });
      if (workImage) {
        content.push(workImage);
      } else if (input.workImage.text) {
        content.push({
          type: "text",
          text: input.workImage.text.slice(0, 20_000),
        });
      } else {
        content.push({
          type: "text",
          text: `(work image unavailable; url=${input.workImage.url})`,
        });
      }

      const response = await client.messages.create({
        model: config.model,
        max_tokens: 400,
        messages: [{ role: "user", content }],
      });

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      const parsed = verdictSchema.parse(extractJsonObject(text));
      return {
        decision: parsed.decision,
        notes: parsed.notes,
        provider: "claude",
      };
    },
  };
}
