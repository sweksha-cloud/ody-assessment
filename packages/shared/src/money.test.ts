import { describe, expect, it } from "vitest";
import { formatCents } from "./money";

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(1000)).toBe("$10.00");
  });

  it("formats cents that aren't a round dollar amount", () => {
    expect(formatCents(1099)).toBe("$10.99");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("respects a non-default currency", () => {
    expect(formatCents(1000, "EUR")).toBe("€10.00");
  });
});
