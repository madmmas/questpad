import { describe, expect, it } from "vitest";
import { books, problems, submissions } from "@/lib/db/schema";

describe("schema", () => {
  it("exports core tables", () => {
    expect(books).toBeDefined();
    expect(problems).toBeDefined();
    expect(submissions).toBeDefined();
  });
});
