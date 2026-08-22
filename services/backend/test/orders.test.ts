import { beforeEach, describe, expect, it } from "vitest";
import { seedBaseFixtures } from "./fixtures";
import { createTestApp, createTestDb, type TestDb } from "./testDb";

let db: TestDb;
let app: ReturnType<typeof createTestApp>;
let fixtures: Awaited<ReturnType<typeof seedBaseFixtures>>;

beforeEach(async () => {
  db = await createTestDb();
  app = createTestApp(db);
  fixtures = await seedBaseFixtures(db);
});

function postOrders(body: unknown) {
  return app.request("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /orders — validation", () => {
  it("rejects a payload with no items", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a payload with neither customerId nor customer", async () => {
    const res = await postOrders({
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a payload with both customerId and customer", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      customer: { name: "Someone Else" },
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects a non-positive quantity", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 0 }],
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown menu item id", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: "00000000-0000-0000-0000-000000000000", quantity: 1 }],
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown menu item/i);
  });

  it("rejects an unavailable menu item", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: fixtures.unavailableItem.id, quantity: 1 }],
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);
  });

  it("rejects an unknown customerId", async () => {
    const res = await postOrders({
      customerId: "00000000-0000-0000-0000-000000000000",
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown customerId/i);
  });
});

describe("POST /orders — happy path", () => {
  it("computes subtotal/tax/total server-side from menu item price and the seeded tax rate", async () => {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 3 }],
    });
    expect(res.status).toBe(201);
    const body = await res.json();

    // 3 x $10.00 = $30.00 subtotal, 10% tax rate from fixtures.
    expect(body.subtotalCents).toBe(3000);
    expect(body.taxCents).toBe(300);
    expect(body.totalCents).toBe(3300);
    expect(body.status).toBe("pending");
    expect(body.allowedTransitions.sort()).toEqual(["cancelled", "confirmed"]);
    expect(body.orderItems).toHaveLength(1);
    expect(body.orderItems[0].unitPriceCents).toBe(1000);
  });

  it("ignores a client-supplied price and always prices from the menu item", async () => {
    // Intentionally includes a `unitPriceCents` field the request schema
    // doesn't define, to prove the server prices from the menu item, not
    // the client. `postOrders` takes `unknown`, so nothing here needs a
    // type-level bypass.
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1, unitPriceCents: 1 }],
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.subtotalCents).toBe(1000);
  });

  it("creates a new customer inline and attaches the order to it", async () => {
    const res = await postOrders({
      customer: { name: "Brand New Customer", email: "new@example.com" },
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.customer.name).toBe("Brand New Customer");
    expect(body.customer.id).not.toBe(fixtures.customer.id);

    const customerRes = await app.request(`/customers/${body.customer.id}`);
    expect(customerRes.status).toBe(200);
  });
});

describe("PATCH /orders/{id}/status", () => {
  async function createPendingOrder() {
    const res = await postOrders({
      customerId: fixtures.customer.id,
      items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
    });
    return res.json();
  }

  function patchStatus(id: string, status: string) {
    return app.request(`/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  it("allows a valid transition (pending -> confirmed)", async () => {
    const order = await createPendingOrder();
    const res = await patchStatus(order.id, "confirmed");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("confirmed");
    expect(body.allowedTransitions.sort()).toEqual(["cancelled", "preparing"]);
  });

  it("rejects an invalid transition (pending -> ready, skipping intermediate states)", async () => {
    const order = await createPendingOrder();
    const res = await patchStatus(order.id, "ready");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/cannot transition/i);

    // and the order is untouched
    const detail = await (await app.request(`/orders/${order.id}`)).json();
    expect(detail.status).toBe("pending");
  });

  it("rejects any transition out of a terminal status", async () => {
    const order = await createPendingOrder();
    await patchStatus(order.id, "cancelled");
    const res = await patchStatus(order.id, "confirmed");
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown order id", async () => {
    const res = await patchStatus("00000000-0000-0000-0000-000000000000", "confirmed");
    expect(res.status).toBe(404);
  });

  it("rejects an unrecognized status value", async () => {
    const order = await createPendingOrder();
    const res = await patchStatus(order.id, "not-a-real-status");
    expect(res.status).toBe(400);
  });
});

describe("GET /orders — filtering", () => {
  it("filters by status", async () => {
    const pending = await (
      await postOrders({
        customerId: fixtures.customer.id,
        items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
      })
    ).json();
    const confirmed = await (
      await postOrders({
        customerId: fixtures.customer.id,
        items: [{ menuItemId: fixtures.availableItem.id, quantity: 1 }],
      })
    ).json();
    await app.request(`/orders/${confirmed.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });

    const res = await app.request("/orders?status=pending");
    const body = await res.json();
    const ids = body.map((o: { id: string }) => o.id);
    expect(ids).toContain(pending.id);
    expect(ids).not.toContain(confirmed.id);
  });
});
