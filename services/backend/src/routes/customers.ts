import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { customers, customersSelectSchema, ordersSelectSchema } from "../db/schema";
import { firstOrThrow } from "../db/util";
import type { AppEnv } from "../env";

const ErrorSchema = z.object({ error: z.string() });
const IdParamSchema = z.object({ id: z.string().uuid() });

const CustomerSchema = customersSelectSchema.openapi("Customer");
const CreateCustomerSchema = customersSelectSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .openapi("CreateCustomer");
const UpdateCustomerSchema = CreateCustomerSchema.partial().openapi("UpdateCustomer");

// Spend/order-count are computed via query, never denormalized onto the table.
const CustomerWithStatsSchema = CustomerSchema.extend({
  orderCount: z.number().int(),
  totalSpentCents: z.number().int(),
}).openapi("CustomerWithStats");

const CustomerDetailSchema = CustomerSchema.extend({
  orders: z.array(ordersSelectSchema),
}).openapi("CustomerDetail");

export const customerRoutes = new OpenAPIHono<AppEnv>();

customerRoutes.openapi(
  createRoute({
    method: "get",
    path: "/customers",
    responses: {
      200: {
        content: { "application/json": { schema: z.array(CustomerWithStatsSchema) } },
        description: "List customers with computed order count / spend",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const rows = await db.query.customers.findMany({
      orderBy: (customers, { asc }) => [asc(customers.name)],
      with: { orders: { columns: { status: true, totalCents: true } } },
    });
    return c.json(
      rows.map(({ orders, ...customer }) => ({
        ...customer,
        orderCount: orders.length,
        totalSpentCents: orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + o.totalCents, 0),
      })),
      200,
    );
  },
);

customerRoutes.openapi(
  createRoute({
    method: "post",
    path: "/customers",
    request: { body: { content: { "application/json": { schema: CreateCustomerSchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: CustomerSchema } },
        description: "Customer created",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");
    const row = firstOrThrow(await db.insert(customers).values(body).returning());
    return c.json(row, 201);
  },
);

customerRoutes.openapi(
  createRoute({
    method: "get",
    path: "/customers/{id}",
    request: { params: IdParamSchema },
    responses: {
      200: {
        content: { "application/json": { schema: CustomerDetailSchema } },
        description: "Customer detail with order history",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Customer not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const row = await db.query.customers.findFirst({
      where: eq(customers.id, id),
      with: { orders: { orderBy: (orders, { desc }) => [desc(orders.createdAt)] } },
    });
    if (!row) return c.json({ error: "Customer not found" }, 404);
    return c.json(row, 200);
  },
);

customerRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/customers/{id}",
    request: {
      params: IdParamSchema,
      body: { content: { "application/json": { schema: UpdateCustomerSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: CustomerSchema } },
        description: "Customer updated",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Customer not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(customers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    if (!row) return c.json({ error: "Customer not found" }, 404);
    return c.json(row, 200);
  },
);
