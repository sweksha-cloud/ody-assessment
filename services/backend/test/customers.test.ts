import { beforeEach, describe, expect, it } from "vitest";
import { customers, orders } from "../src/db/schema";
import { seedBaseFixtures } from "./fixtures";
import { createTestApp, createTestDb, type TestDb } from "./testDb";

let db: TestDb;
let app: ReturnType<typeof createTestApp>;

beforeEach(async () => {
  db = await createTestDb();
  app = createTestApp(db);
});

function postJson(path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function patchJson(path: string, body: unknown) {
  return app.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /customers", () => {
  it("creates a customer", async () => {
    const res = await postJson("/customers", { name: "New Customer", email: "new@example.com", phone: null });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("New Customer");
  });

  it("rejects a payload missing email/phone (nullable, not optional, on this schema)", async () => {
    const res = await postJson("/customers", { name: "New Customer" });
    expect(res.status).toBe(400);
  });
});

describe("GET /customers — computed stats", () => {
  it("sums totalCents across orders and excludes cancelled ones from spend", async () => {
    const { customer } = await seedBaseFixtures(db);

    await db.insert(orders).values([
      { customerId: customer.id, status: "completed", subtotalCents: 1000, taxCents: 100, totalCents: 1100 },
      { customerId: customer.id, status: "pending", subtotalCents: 500, taxCents: 50, totalCents: 550 },
      { customerId: customer.id, status: "cancelled", subtotalCents: 2000, taxCents: 200, totalCents: 2200 },
    ]);

    const res = await app.request("/customers");
    expect(res.status).toBe(200);
    const body = await res.json();
    const row = body.find((c: { id: string }) => c.id === customer.id);
    expect(row).toBeDefined();
    expect(row.orderCount).toBe(3);
    expect(row.totalSpentCents).toBe(1100 + 550);
  });

  it("returns zeroed stats for a customer with no orders", async () => {
    const [fresh] = await db.insert(customers).values({ name: "No Orders Yet" }).returning();
    const res = await app.request("/customers");
    const body = await res.json();
    const row = body.find((c: { id: string }) => c.id === fresh!.id);
    expect(row.orderCount).toBe(0);
    expect(row.totalSpentCents).toBe(0);
  });
});

describe("GET /customers/{id}", () => {
  it("returns order history", async () => {
    const { customer } = await seedBaseFixtures(db);
    await db.insert(orders).values({ customerId: customer.id, status: "pending", subtotalCents: 100, taxCents: 10, totalCents: 110 });

    const res = await app.request(`/customers/${customer.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
  });

  it("returns 404 for an unknown customer id", async () => {
    const res = await app.request("/customers/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /customers/{id}", () => {
  it("updates a customer's fields", async () => {
    const { customer } = await seedBaseFixtures(db);
    const res = await patchJson(`/customers/${customer.id}`, { phone: "555-0199" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.phone).toBe("555-0199");
    expect(body.name).toBe(customer.name);
  });

  it("returns 404 for an unknown customer id", async () => {
    const res = await patchJson("/customers/00000000-0000-0000-0000-000000000000", { phone: "555-0199" });
    expect(res.status).toBe(404);
  });
});
