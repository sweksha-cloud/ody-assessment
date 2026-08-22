import { z } from "@hono/zod-openapi";
import { ORDER_STATUSES } from "@odyssey/shared";
import {
  customersSelectSchema,
  menuCategoriesSelectSchema,
  menuItemsSelectSchema,
  orderingSettingsSelectSchema,
  orderItemsSelectSchema,
  ordersSelectSchema,
} from "./db/schema";

// Canonical, `.openapi()`-tagged base schemas for every entity — the single
// place each shape is registered as a reusable OpenAPI component. Route
// files must import these (not the raw drizzle-zod schemas from db/schema.ts)
// whenever a schema is embedded inside another response, so Orval emits one
// shared model + $ref/allOf composition instead of a duplicate inline copy
// per call site.
export const OrderStatusSchema = z.enum(ORDER_STATUSES).openapi("OrderStatus");

export const MenuCategorySchema = menuCategoriesSelectSchema.openapi("MenuCategory");
export const MenuItemSchema = menuItemsSelectSchema.openapi("MenuItem");
export const CustomerSchema = customersSelectSchema.openapi("Customer");
export const OrderItemSchema = orderItemsSelectSchema.openapi("OrderItem");
export const OrderSchema = ordersSelectSchema
  .extend({ status: OrderStatusSchema })
  .openapi("Order");
export const OrderingSettingsSchema = orderingSettingsSelectSchema.openapi("OrderingSettings");
