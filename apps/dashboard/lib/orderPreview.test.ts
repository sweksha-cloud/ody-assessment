import { describe, expect, it } from "vitest";
import { computeOrderPreviewTotals } from "./orderPreview";

const items = [
  { id: "burger", priceCents: 1000 },
  { id: "fries", priceCents: 350 },
];

describe("computeOrderPreviewTotals", () => {
  it("returns zeroed totals with no lines", () => {
    expect(computeOrderPreviewTotals([], items, 10)).toEqual({
      subtotalCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });

  it("sums price x quantity across multiple lines and applies tax", () => {
    const result = computeOrderPreviewTotals(
      [
        { menuItemId: "burger", quantity: 2 },
        { menuItemId: "fries", quantity: 1 },
      ],
      items,
      10,
    );
    // (2 x 1000) + (1 x 350) = 2350 subtotal, 10% tax rounds to 235
    expect(result.subtotalCents).toBe(2350);
    expect(result.taxCents).toBe(235);
    expect(result.totalCents).toBe(2585);
  });

  it("ignores a line whose menu item isn't in the provided item list", () => {
    const result = computeOrderPreviewTotals(
      [{ menuItemId: "unknown-item", quantity: 5 }],
      items,
      10,
    );
    expect(result.subtotalCents).toBe(0);
  });

  it("rounds tax to the nearest cent", () => {
    // subtotal 1000 at 12.5% = 125 exactly; use a rate that forces rounding
    const result = computeOrderPreviewTotals([{ menuItemId: "burger", quantity: 1 }], items, 8.25);
    expect(result.taxCents).toBe(Math.round(1000 * 0.0825));
  });
});
