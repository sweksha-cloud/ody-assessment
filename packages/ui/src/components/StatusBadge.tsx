import type { OrderStatus } from "@odyssey/types";
import { colors, statusColors } from "../tokens/colors";
import { Badge } from "./Badge";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { bg, fg, border } = statusColors[status];
  return <Badge label={STATUS_LABELS[status]} bg={bg} fg={fg} border={border} dot />;
}

// A standalone cyan "operational" indicator — for real-time state (an
// order actively in the kitchen, a live-updating list), not one of the
// six OrderStatus values statusColors maps.
export function LiveIndicator({ label = "Live" }: { label?: string }) {
  return <Badge label={label} bg={colors.live.bg} fg={colors.live.fg} border={colors.live.border} dot />;
}
