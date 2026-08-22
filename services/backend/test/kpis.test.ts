import { beforeEach, describe, expect, it } from "vitest";
import { menuItems, orderItems, orders } from "../src/db/schema";
import { seedBaseFixtures } from "./fixtures";
import { createTestApp, createTestDb, type TestDb } from "./testDb";

let db: TestDb;
let app: ReturnType<typeof createTestApp>;

beforeEach(async () => {
  db = await createTestDb();
  app = createTestApp(db);
});

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

describe("GET /kpis", () => {
  it("scopes orders-today and revenue-today to today, excluding cancelled from revenue", async () => {
    const { customer } = await seedBaseFixtures(db);

    await db.insert(orders).values([
      { customerId: customer.id, status: "pending", subtotalCents: 1000, taxCents: 0, totalCents: 1000 },
      { customerId: customer.id, status: "completed", subtotalCents: 2000, taxCents: 0, totalCents: 2000 },
      { customerId: customer.id, status: "cancelled", subtotalCents: 5000, taxCents: 0, totalCents: 5000 },
      // outside today's window — must not count toward either figure
      {
        customerId: customer.id,
        status: "completed",
        subtotalCents: 9999,
        taxCents: 0,
        totalCents: 9999,
        createdAt: daysAgo(2),
      },
    ]);

    const res = await app.request("/kpis");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalOrdersToday).toBe(3);
    expect(body.revenueCentsToday).toBe(1000 + 2000);
  });

  it("counts pending orders regardless of when they were created", async () => {
    const { customer } = await seedBaseFixtures(db);

    await db.insert(orders).values([
      { customerId: customer.id, status: "pending", subtotalCents: 100, taxCents: 0, totalCents: 100 },
      {
        customerId: customer.id,
        status: "pending",
        subtotalCents: 100,
        taxCents: 0,
        totalCents: 100,
        createdAt: daysAgo(5),
      },
      { customerId: customer.id, status: "confirmed", subtotalCents: 100, taxCents: 0, totalCents: 100 },
    ]);

    const res = await app.request("/kpis");
    const body = await res.json();
    expect(body.pendingOrders).toBe(2);
  });

  it("ranks popular items by quantity sold in the trailing 30 days, capped at 5", async () => {
    const { category, customer, availableItem } = await seedBaseFixtures(db);

    const [itemB, itemC] = await db
      .insert(menuItems)
      .values([
        { categoryId: category.id, name: "Item B", priceCents: 500 },
        { categoryId: category.id, name: "Item C", priceCents: 500 },
      ])
      .returning();

    const [recentOrder] = await db
      .insert(orders)
      .values({ customerId: customer.id, status: "completed", subtotalCents: 0, taxCents: 0, totalCents: 0 })
      .returning();
    const [oldOrder] = await db
      .insert(orders)
      .values({
        customerId: customer.id,
        status: "completed",
        subtotalCents: 0,
        taxCents: 0,
        totalCents: 0,
        createdAt: daysAgo(45),
      })
      .returning();

    await db.insert(orderItems).values([
      // within window: availableItem sells the most, then itemB, then itemC
      { orderId: recentOrder!.id, menuItemId: availableItem.id, quantity: 10, unitPriceCents: 1000, lineTotalCents: 10000 },
      { orderId: recentOrder!.id, menuItemId: itemB!.id, quantity: 5, unitPriceCents: 500, lineTotalCents: 2500 },
      { orderId: recentOrder!.id, menuItemId: itemC!.id, quantity: 1, unitPriceCents: 500, lineTotalCents: 500 },
      // outside the 30-day window — must not count
      { orderId: oldOrder!.id, menuItemId: itemC!.id, quantity: 100, unitPriceCents: 500, lineTotalCents: 50000 },
    ]);

    const res = await app.request("/kpis");
    const body = await res.json();
    expect(body.popularItems[0]).toMatchObject({ menuItemId: availableItem.id, quantitySold: 10 });
    expect(body.popularItems[1]).toMatchObject({ menuItemId: itemB!.id, quantitySold: 5 });
    expect(body.popularItems[2]).toMatchObject({ menuItemId: itemC!.id, quantitySold: 1 });
  });
});
