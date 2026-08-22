import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { canTransition, getNextValidStatuses } from "@odyssey/shared";
import { eq, inArray } from "drizzle-orm";
import { customers, menuItems, orderingSettings, orderItems, orders } from "../db/schema";
import type { AppEnv } from "../env";
import { CustomerSchema, MenuItemSchema, OrderItemSchema, OrderSchema, OrderStatusSchema } from "../openapi-schemas";

const ErrorSchema = z.object({ error: z.string() });
const IdParamSchema = z.object({ id: z.string().uuid() });

const CustomerSummarySchema = CustomerSchema.pick({
  id: true,
  name: true,
  email: true,
  phone: true,
}).openapi("OrderCustomerSummary");

function toCustomerSummary(customer: typeof customers.$inferSelect) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

const OrderItemWithMenuItemSchema = OrderItemSchema.extend({ menuItem: MenuItemSchema }).openapi(
  "OrderItemWithMenuItem",
);

const OrderListItemSchema = OrderSchema.extend({
  allowedTransitions: z.array(OrderStatusSchema),
  customer: CustomerSummarySchema,
}).openapi("OrderListItem");

const OrderDetailSchema = OrderSchema.extend({
  allowedTransitions: z.array(OrderStatusSchema),
  customer: CustomerSummarySchema,
  orderItems: z.array(OrderItemWithMenuItemSchema),
}).openapi("OrderDetail");

const CreateOrderCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const CreateOrderSchema = z
  .object({
    customerId: z.string().uuid().optional(),
    customer: CreateOrderCustomerSchema.optional(),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          menuItemId: z.string().uuid(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1),
  })
  .refine((data) => Boolean(data.customerId) !== Boolean(data.customer), {
    message: "Provide exactly one of customerId or customer",
    path: ["customerId"],
  })
  .openapi("CreateOrder");

const UpdateOrderStatusSchema = z.object({ status: OrderStatusSchema }).openapi("UpdateOrderStatus");

export const orderRoutes = new OpenAPIHono<AppEnv>();

orderRoutes.openapi(
  createRoute({
    tags: ["Orders"],
    method: "get",
    path: "/orders",
    request: { query: z.object({ status: OrderStatusSchema.optional() }) },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(OrderListItemSchema) } },
        description: "List orders, optionally filtered by status",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { status } = c.req.valid("query");
    const rows = await db.query.orders.findMany({
      where: status ? eq(orders.status, status) : undefined,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: { customer: true },
    });
    return c.json(
      rows.map((row) => ({
        ...row,
        customer: toCustomerSummary(row.customer),
        allowedTransitions: [...getNextValidStatuses(row.status)],
      })),
      200,
    );
  },
);

orderRoutes.openapi(
  createRoute({
    tags: ["Orders"],
    method: "get",
    path: "/orders/{id}",
    request: { params: IdParamSchema },
    responses: {
      200: {
        content: { "application/json": { schema: OrderDetailSchema } },
        description: "Order detail with items and customer",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Order not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const row = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { customer: true, orderItems: { with: { menuItem: true } } },
    });
    if (!row) return c.json({ error: "Order not found" }, 404);
    return c.json(
      {
        ...row,
        customer: toCustomerSummary(row.customer),
        allowedTransitions: [...getNextValidStatuses(row.status)],
      },
      200,
    );
  },
);

orderRoutes.openapi(
  createRoute({
    tags: ["Orders"],
    method: "post",
    path: "/orders",
    request: { body: { content: { "application/json": { schema: CreateOrderSchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: OrderDetailSchema } },
        description: "Order created",
      },
      400: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Unknown/unavailable menu item, or unknown customerId",
      },
      500: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Ordering settings not initialized (should never happen post-seed)",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");

    const requestedItemIds = [...new Set(body.items.map((i) => i.menuItemId))];
    const foundItems = await db.select().from(menuItems).where(inArray(menuItems.id, requestedItemIds));
    const foundById = new Map(foundItems.map((item) => [item.id, item]));

    for (const id of requestedItemIds) {
      const item = foundById.get(id);
      if (!item) return c.json({ error: `Unknown menu item: ${id}` }, 400);
      if (!item.isAvailable) return c.json({ error: `Menu item unavailable: ${item.name}` }, 400);
    }

    let resolvedCustomerId: string;
    if (body.customerId) {
      const [existingCustomer] = await db.select().from(customers).where(eq(customers.id, body.customerId));
      if (!existingCustomer) return c.json({ error: "Unknown customerId" }, 400);
      resolvedCustomerId = existingCustomer.id;
    } else {
      resolvedCustomerId = crypto.randomUUID();
    }

    const [settings] = await db.select().from(orderingSettings).where(eq(orderingSettings.id, 1));
    if (!settings) return c.json({ error: "Ordering settings not initialized" }, 500);
    const taxRatePercent = Number(settings.taxRatePercent);

    const lineItems = body.items.map((requested) => {
      // Existence + availability already checked in the loop above.
      const item = foundById.get(requested.menuItemId)!;
      return {
        id: crypto.randomUUID(),
        menuItemId: item.id,
        quantity: requested.quantity,
        unitPriceCents: item.priceCents,
        lineTotalCents: item.priceCents * requested.quantity,
      };
    });
    const subtotalCents = lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0);
    const taxCents = Math.round(subtotalCents * (taxRatePercent / 100));
    const totalCents = subtotalCents + taxCents;

    const orderId = crypto.randomUUID();
    const orderInsert = db.insert(orders).values({
      id: orderId,
      customerId: resolvedCustomerId,
      status: "pending",
      subtotalCents,
      taxCents,
      totalCents,
      notes: body.notes,
    });
    const itemsInsert = db.insert(orderItems).values(lineItems.map((li) => ({ ...li, orderId })));

    // neon-http has no imperative transaction support; db.batch() is the
    // atomic primitive it does support, so ids are generated client-side
    // and every insert that must succeed/fail together goes in one batch.
    if (body.customer) {
      const customerInsert = db.insert(customers).values({ id: resolvedCustomerId, ...body.customer });
      await db.batch([customerInsert, orderInsert, itemsInsert]);
    } else {
      await db.batch([orderInsert, itemsInsert]);
    }

    const created = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { customer: true, orderItems: { with: { menuItem: true } } },
    });
    if (!created) throw new Error("Order was inserted but could not be re-read");

    return c.json(
      {
        ...created,
        customer: toCustomerSummary(created.customer),
        allowedTransitions: [...getNextValidStatuses(created.status)],
      },
      201,
    );
  },
);

orderRoutes.openapi(
  createRoute({
    tags: ["Orders"],
    method: "patch",
    path: "/orders/{id}/status",
    request: {
      params: IdParamSchema,
      body: { content: { "application/json": { schema: UpdateOrderStatusSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: OrderDetailSchema } },
        description: "Order status updated",
      },
      400: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Invalid status transition",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Order not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const { status: nextStatus } = c.req.valid("json");

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) return c.json({ error: "Order not found" }, 404);

    if (!canTransition(existing.status, nextStatus)) {
      return c.json(
        { error: `Cannot transition order from '${existing.status}' to '${nextStatus}'` },
        400,
      );
    }

    await db.update(orders).set({ status: nextStatus, updatedAt: new Date() }).where(eq(orders.id, id));

    const updated = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { customer: true, orderItems: { with: { menuItem: true } } },
    });
    if (!updated) return c.json({ error: "Order not found" }, 404);

    return c.json(
      {
        ...updated,
        customer: toCustomerSummary(updated.customer),
        allowedTransitions: [...getNextValidStatuses(updated.status)],
      },
      200,
    );
  },
);
