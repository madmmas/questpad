import { describe, expect, it } from "vitest";
import {
  buildTaggedProblemDraft,
  normalizeTags,
  parseTagsField,
  validateProblemImage,
} from "@/lib/problems/tagging";

describe("normalizeTags", () => {
  it("returns null for empty input", () => {
    expect(normalizeTags(undefined)).toBeNull();
    expect(normalizeTags([])).toBeNull();
  });

  it("lowercases, trims, and dedupes tags", () => {
    expect(normalizeTags([" Fractions ", "fractions", "WORD-problems"])).toBe(
      "fractions,word-problems",
    );
  });
});

describe("parseTagsField", () => {
  it("splits a comma-separated field", () => {
    expect(parseTagsField("math,  reading ,")).toEqual(["math", "reading"]);
  });

  it("returns an empty list for blank values", () => {
    expect(parseTagsField("")).toEqual([]);
    expect(parseTagsField(null)).toEqual([]);
  });
});

describe("buildTaggedProblemDraft", () => {
  it("builds a draft for valid parent tagging metadata", () => {
    expect(
      buildTaggedProblemDraft({
        bookTitle: " Math Workbook ",
        subject: " Math ",
        difficulty: "silver",
        tags: ["Page 12", "addition"],
      }),
    ).toEqual({
      bookTitle: "Math Workbook",
      subject: "Math",
      difficulty: "silver",
      tags: "page 12,addition",
    });
  });

  it("rejects invalid difficulty tiers", () => {
    expect(() =>
      buildTaggedProblemDraft({
        bookTitle: "Math Workbook",
        subject: "Math",
        // @ts-expect-error intentional invalid tier
        difficulty: "platinum",
      }),
    ).toThrow(/bronze, silver, or gold/i);
  });

  it("requires book title and subject", () => {
    expect(() =>
      buildTaggedProblemDraft({
        bookTitle: " ",
        subject: "Math",
        difficulty: "bronze",
      }),
    ).toThrow(/book title/i);

    expect(() =>
      buildTaggedProblemDraft({
        bookTitle: "Math Workbook",
        subject: "",
        difficulty: "bronze",
      }),
    ).toThrow(/subject/i);
  });
});

describe("validateProblemImage", () => {
  it("accepts supported image metadata", () => {
    expect(() =>
      validateProblemImage({
        name: "page.png",
        type: "image/png",
        size: 2048,
      }),
    ).not.toThrow();
  });

  it("rejects missing, oversized, or unsupported files", () => {
    expect(() =>
      validateProblemImage({ name: "", type: "image/png", size: 0 }),
    ).toThrow(/required/i);

    expect(() =>
      validateProblemImage({
        name: "notes.pdf",
        type: "application/pdf",
        size: 100,
      }),
    ).toThrow(/jpeg, png, webp, or gif/i);

    expect(() =>
      validateProblemImage({
        name: "huge.png",
        type: "image/png",
        size: 11 * 1024 * 1024,
      }),
    ).toThrow(/10mb/i);
  });
});
