import { beforeEach, describe, expect, it } from "vitest";
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

describe("Menu categories", () => {
  it("lists categories ordered by sortOrder", async () => {
    await postJson("/menu/categories", { name: "Beverages", sortOrder: 1 });
    await postJson("/menu/categories", { name: "Appetizers", sortOrder: 0 });

    const res = await app.request("/menu/categories");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.map((c: { name: string }) => c.name)).toEqual(["Appetizers", "Beverages"]);
  });

  it("creates a category", async () => {
    const res = await postJson("/menu/categories", { name: "Entrees", sortOrder: 0 });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Entrees");
    expect(body.id).toBeTruthy();
  });

  it("rejects a category payload missing sortOrder", async () => {
    // sortOrder has a DB default, but the request schema is built from the
    // drizzle *select* schema (every stored column, including defaulted
    // ones, is required there) rather than an insert schema — so it must
    // be supplied explicitly even though the column itself doesn't require it.
    const res = await postJson("/menu/categories", { name: "Entrees" });
    expect(res.status).toBe(400);
  });

  it("updates a category name", async () => {
    const created = await (await postJson("/menu/categories", { name: "Old Name", sortOrder: 0 })).json();
    const res = await patchJson(`/menu/categories/${created.id}`, { name: "New Name" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("New Name");
  });

  it("returns 404 updating an unknown category", async () => {
    const res = await patchJson("/menu/categories/00000000-0000-0000-0000-000000000000", { name: "X" });
    expect(res.status).toBe(404);
  });
});

describe("Menu items", () => {
  it("creates an item under a category", async () => {
    const { category } = await seedBaseFixtures(db);
    const res = await postJson("/menu/items", {
      categoryId: category.id,
      name: "New Item",
      description: null,
      priceCents: 1250,
      isAvailable: true,
      imageUrl: null,
      sortOrder: 0,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("New Item");
    expect(body.priceCents).toBe(1250);
  });

  it("rejects an item payload missing categoryId", async () => {
    const res = await postJson("/menu/items", {
      name: "New Item",
      description: null,
      priceCents: 1250,
      isAvailable: true,
      imageUrl: null,
      sortOrder: 0,
    });
    expect(res.status).toBe(400);
  });

  it("filters items by categoryId", async () => {
    const { category, availableItem, unavailableItem } = await seedBaseFixtures(db);
    const res = await app.request(`/menu/items?categoryId=${category.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    const ids = body.map((i: { id: string }) => i.id);
    expect(ids.sort()).toEqual([availableItem.id, unavailableItem.id].sort());
  });

  it("toggles availability (soft delete) without removing the row", async () => {
    const { category, availableItem } = await seedBaseFixtures(db);
    const res = await patchJson(`/menu/items/${availableItem.id}`, { isAvailable: false });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isAvailable).toBe(false);
    expect(body.id).toBe(availableItem.id);

    // the row still exists (soft delete, not a real DELETE)
    const stillThere = await app.request(`/menu/items?categoryId=${category.id}`);
    const items = await stillThere.json();
    expect(items.map((i: { id: string }) => i.id)).toContain(availableItem.id);
  });

  it("returns 404 updating an unknown item", async () => {
    const res = await patchJson("/menu/items/00000000-0000-0000-0000-000000000000", { isAvailable: false });
    expect(res.status).toBe(404);
  });
});
