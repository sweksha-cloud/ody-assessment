import type { OrderStatus } from "@odyssey/types";
import { statusColors } from "../tokens/colors";
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
  return <Badge label={STATUS_LABELS[status]} bg={bg} fg={fg} border={border} />;
}
