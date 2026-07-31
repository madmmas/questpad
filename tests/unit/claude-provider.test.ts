import { describe, expect, it, vi } from "vitest";
import { createClaudeAiReviewProvider } from "@/lib/ai/claude-provider";

describe("createClaudeAiReviewProvider", () => {
  it("parses a JSON verdict from the Claude response", async () => {
    const create = vi.fn().mockResolvedValue({
      content: [
        {
          type: "text",
          text: '{"decision":"rejected","notes":"Check question 2 again."}',
        },
      ],
    });

    const provider = createClaudeAiReviewProvider(
      { apiKey: "sk-test", model: "claude-test" },
      { messages: { create } } as never,
    );

    const verdict = await provider.review({
      submissionId: "s1",
      problemImage: {
        url: "/p.png",
        mediaType: "image/png",
        bytes: Buffer.from("png-bytes"),
      },
      workImage: {
        url: "/w.svg",
        mediaType: "image/svg+xml",
        bytes: Buffer.from("<svg>work</svg>"),
        text: "<svg>work</svg>",
      },
      bookTitle: "Math Workbook",
      difficulty: "gold",
    });

    expect(create).toHaveBeenCalledOnce();
    expect(verdict).toEqual({
      decision: "rejected",
      notes: "Check question 2 again.",
      provider: "claude",
    });
  });
});
