import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDateTime, formatRelativeTime } from "./date";

describe("formatDateTime", () => {
  it("includes the year and formats without throwing", () => {
    // Picked away from a year boundary so no timezone offset can push it
    // into a different year, keeping this assertion timezone-independent.
    const result = formatDateTime("2024-06-15T12:00:00.000Z");
    expect(result).toContain("2024");
  });

  it("produces different output for different timestamps", () => {
    const a = formatDateTime("2024-06-15T12:00:00.000Z");
    const b = formatDateTime("2024-11-01T09:30:00.000Z");
    expect(a).not.toBe(b);
  });
});

describe("formatRelativeTime", () => {
  const NOW = new Date("2024-06-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for a timestamp well under a minute old", () => {
    // formatRelativeTime rounds to the nearest minute, so anything at or
    // past the 30s midpoint reads as "1m ago" — pick well clear of that.
    const iso = new Date(NOW.getTime() - 10_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("just now");
  });

  it("returns minutes ago for a timestamp under an hour old", () => {
    const iso = new Date(NOW.getTime() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("5m ago");
  });

  it("returns hours ago for a timestamp under a day old", () => {
    const iso = new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("3h ago");
  });

  it("returns days ago for a timestamp a day or more old", () => {
    const iso = new Date(NOW.getTime() - 2 * 24 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2d ago");
  });
});
