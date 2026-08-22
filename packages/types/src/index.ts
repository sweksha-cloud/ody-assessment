// Ergonomic re-exports of the Orval-generated contract types — the
// frontend's only source of truth for API-shaped data. Nothing here
// duplicates a shape drizzle-zod/Orval already produces; this file just
// gives the generated names a stable, friendlier import surface.
//
// Backend route handlers use drizzle's own `$inferSelect`/`$inferInsert`
// directly from services/backend/src/db/schema.ts for internal DB-row
// typing — that stays local to the backend rather than round-tripping
// through this package, so a shared package never depends on a service.
export type {
  Customer,
  CustomerDetail,
  CustomerWithStats,
  CreateCustomer,
  UpdateCustomer,
  MenuCategory,
  MenuItem,
  CreateMenuCategory,
  UpdateMenuCategory,
  CreateMenuItem,
  UpdateMenuItem,
  Order,
  OrderDetail,
  OrderItem,
  OrderItemWithMenuItem,
  OrderStatus,
  CreateOrder,
  UpdateOrderStatus,
  OrderingSettings,
  UpdateOrderingSettings,
  Kpis,
  HealthResponse,
} from "@odyssey/api-client";

export type { OrderListItem as OrderSummary } from "@odyssey/api-client";
