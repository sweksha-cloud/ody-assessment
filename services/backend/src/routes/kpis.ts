import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq, gte, sql } from "drizzle-orm";
import { menuItems, orderItems, orders } from "../db/schema";
import type { AppEnv } from "../env";

const POPULAR_ITEMS_LIMIT = 5;
const POPULAR_ITEMS_WINDOW_DAYS = 30;

const PopularItemSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string(),
  quantitySold: z.number().int(),
});

// KPI definitions (see README for rationale):
// - totalOrdersToday / revenueCentsToday: scoped to today; revenue excludes
//   cancelled orders but counts everything else as "expected" revenue.
// - pendingOrders: current count in `pending` status, not time-scoped.
// - popularItems: top-N by quantity sold, trailing 30 days.
const KpiSchema = z
  .object({
    totalOrdersToday: z.number().int(),
    revenueCentsToday: z.number().int(),
    pendingOrders: z.number().int(),
    popularItems: z.array(PopularItemSchema),
  })
  .openapi("Kpis");

export const kpiRoutes = new OpenAPIHono<AppEnv>();

kpiRoutes.openapi(
  createRoute({
    method: "get",
    path: "/kpis",
    responses: {
      200: {
        content: { "application/json": { schema: KpiSchema } },
        description: "Dashboard KPI summary",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const popularItemsSince = new Date();
    popularItemsSince.setDate(popularItemsSince.getDate() - POPULAR_ITEMS_WINDOW_DAYS);

    const [todayStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        revenueCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} != 'cancelled'), 0)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, startOfToday));

    const [pendingStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const popularItems = await db
      .select({
        menuItemId: orderItems.menuItemId,
        name: menuItems.name,
        quantitySold: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(gte(orders.createdAt, popularItemsSince))
      .groupBy(orderItems.menuItemId, menuItems.name)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(POPULAR_ITEMS_LIMIT);

    return c.json(
      {
        totalOrdersToday: todayStats?.totalOrders ?? 0,
        revenueCentsToday: todayStats?.revenueCents ?? 0,
        pendingOrders: pendingStats?.count ?? 0,
        popularItems,
      },
      200,
    );
  },
);
