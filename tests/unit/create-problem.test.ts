import { describe, expect, it, vi } from "vitest";
import { createTaggedProblem } from "@/lib/problems/create-problem";

describe("createTaggedProblem", () => {
  it("uploads the image and persists book + problem tags", async () => {
    const uploadImage = vi.fn().mockResolvedValue({
      url: "https://blob.example/problems/page.png",
    });
    const findOrCreateBook = vi.fn().mockResolvedValue({
      id: "book-1",
      title: "Math Workbook",
      subject: "Math",
    });
    const insertProblem = vi.fn().mockResolvedValue({
      id: "problem-1",
      bookId: "book-1",
      imageUrl: "https://blob.example/problems/page.png",
      difficulty: "gold",
      tags: "fractions",
    });

    const result = await createTaggedProblem(
      {
        image: {
          name: "page.png",
          type: "image/png",
          size: 128,
          data: new ArrayBuffer(128),
        },
        tags: {
          bookTitle: "Math Workbook",
          subject: "Math",
          difficulty: "gold",
          tags: ["fractions"],
        },
      },
      { uploadImage, findOrCreateBook, insertProblem },
    );

    expect(uploadImage).toHaveBeenCalledOnce();
    expect(findOrCreateBook).toHaveBeenCalledWith({
      title: "Math Workbook",
      subject: "Math",
    });
    expect(insertProblem).toHaveBeenCalledWith({
      bookId: "book-1",
      imageUrl: "https://blob.example/problems/page.png",
      difficulty: "gold",
      tags: "fractions",
    });
    expect(result.problem.id).toBe("problem-1");
  });

  it("does not persist when image validation fails", async () => {
    const uploadImage = vi.fn();
    const findOrCreateBook = vi.fn();
    const insertProblem = vi.fn();

    await expect(
      createTaggedProblem(
        {
          image: {
            name: "page.txt",
            type: "text/plain",
            size: 12,
            data: new ArrayBuffer(12),
          },
          tags: {
            bookTitle: "Math Workbook",
            subject: "Math",
            difficulty: "bronze",
          },
        },
        { uploadImage, findOrCreateBook, insertProblem },
      ),
    ).rejects.toThrow(/jpeg, png, webp, or gif/i);

    expect(uploadImage).not.toHaveBeenCalled();
    expect(findOrCreateBook).not.toHaveBeenCalled();
    expect(insertProblem).not.toHaveBeenCalled();
  });
});
