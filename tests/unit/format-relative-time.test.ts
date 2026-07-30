import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "@/lib/format-relative-time";

const now = new Date("2026-01-10T12:00:00Z");

describe("formatRelativeTime", () => {
  it("returns 'just now' for sub-minute differences", () => {
    const date = new Date("2026-01-10T11:59:45Z");
    expect(formatRelativeTime(date, now)).toBe("just now");
  });

  it("formats minutes", () => {
    const date = new Date("2026-01-10T11:55:00Z");
    expect(formatRelativeTime(date, now)).toBe("5 minutes ago");
  });

  it("uses singular minute", () => {
    const date = new Date("2026-01-10T11:59:00Z");
    expect(formatRelativeTime(date, now)).toBe("1 minute ago");
  });

  it("formats hours", () => {
    const date = new Date("2026-01-10T10:00:00Z");
    expect(formatRelativeTime(date, now)).toBe("2 hours ago");
  });

  it("uses singular hour", () => {
    const date = new Date("2026-01-10T11:00:00Z");
    expect(formatRelativeTime(date, now)).toBe("1 hour ago");
  });

  it("returns 'yesterday' for exactly one day", () => {
    const date = new Date("2026-01-09T12:00:00Z");
    expect(formatRelativeTime(date, now)).toBe("yesterday");
  });

  it("formats multiple days", () => {
    const date = new Date("2026-01-05T12:00:00Z");
    expect(formatRelativeTime(date, now)).toBe("5 days ago");
  });
});
