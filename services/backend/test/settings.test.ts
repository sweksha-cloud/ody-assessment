import { beforeEach, describe, expect, it } from "vitest";
import { seedBaseFixtures } from "./fixtures";
import { createTestApp, createTestDb, type TestDb } from "./testDb";

let db: TestDb;
let app: ReturnType<typeof createTestApp>;

beforeEach(async () => {
  db = await createTestDb();
  app = createTestApp(db);
});

describe("GET /settings", () => {
  it("returns the singleton settings row", async () => {
    await seedBaseFixtures(db);
    const res = await app.request("/settings");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.taxRatePercent).toBe("10.00");
    expect(body.isOrderingEnabled).toBe(true);
  });

  it("returns 500 when the settings row hasn't been initialized", async () => {
    const res = await app.request("/settings");
    expect(res.status).toBe(500);
  });
});

describe("PATCH /settings", () => {
  it("updates a subset of fields, leaving the rest untouched", async () => {
    await seedBaseFixtures(db);
    const res = await app.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimatedPrepTimeMinutes: 35, isOrderingEnabled: false }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estimatedPrepTimeMinutes).toBe(35);
    expect(body.isOrderingEnabled).toBe(false);
    // untouched field survives the partial update
    expect(body.taxRatePercent).toBe("10.00");
  });

  it("returns 500 when the settings row hasn't been initialized", async () => {
    const res = await app.request("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOrderingEnabled: false }),
    });
    expect(res.status).toBe(500);
  });
});
