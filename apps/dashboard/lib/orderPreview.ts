import type { MenuItem } from "@odyssey/types";

export type OrderPreviewLine = { menuItemId: string; quantity: number };

// Pure client-side mirror of the backend's order-total calculation
// (services/backend/src/routes/orders.ts), used to render a live preview
// while the order is being built. The server recomputes and is the actual
// source of truth for the persisted total — this never gets trusted as-is.
export function computeOrderPreviewTotals(
  lines: OrderPreviewLine[],
  items: Pick<MenuItem, "id" | "priceCents">[],
  taxRatePercent: number,
) {
  const subtotalCents = lines.reduce((sum, line) => {
    const item = items.find((candidate) => candidate.id === line.menuItemId);
    return sum + (item ? item.priceCents * line.quantity : 0);
  }, 0);
  const taxCents = Math.round(subtotalCents * (taxRatePercent / 100));
  const totalCents = subtotalCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}
