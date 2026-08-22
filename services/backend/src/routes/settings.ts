import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { orderingSettings, orderingSettingsSelectSchema } from "../db/schema";
import type { AppEnv } from "../env";

const ErrorSchema = z.object({ error: z.string() });

const SettingsSchema = orderingSettingsSelectSchema.openapi("OrderingSettings");
const UpdateSettingsSchema = orderingSettingsSelectSchema
  .omit({ id: true })
  .partial()
  .openapi("UpdateOrderingSettings");

export const settingsRoutes = new OpenAPIHono<AppEnv>();

settingsRoutes.openapi(
  createRoute({
    method: "get",
    path: "/settings",
    responses: {
      200: {
        content: { "application/json": { schema: SettingsSchema } },
        description: "The singleton ordering settings row",
      },
      500: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Settings row missing (should never happen post-seed)",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const [row] = await db.select().from(orderingSettings).where(eq(orderingSettings.id, 1));
    if (!row) return c.json({ error: "Ordering settings not initialized" }, 500);
    return c.json(row, 200);
  },
);

settingsRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/settings",
    request: { body: { content: { "application/json": { schema: UpdateSettingsSchema } } } },
    responses: {
      200: {
        content: { "application/json": { schema: SettingsSchema } },
        description: "Ordering settings updated",
      },
      500: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Settings row missing (should never happen post-seed)",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");
    const [row] = await db
      .update(orderingSettings)
      .set(body)
      .where(eq(orderingSettings.id, 1))
      .returning();
    if (!row) return c.json({ error: "Ordering settings not initialized" }, 500);
    return c.json(row, 200);
  },
);
