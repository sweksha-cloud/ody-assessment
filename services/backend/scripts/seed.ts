import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(scriptDir, "../../../.env") });

import { createDb } from "../src/db/client";
import {
  customers,
  menuCategories,
  menuItems,
  orderItems,
  orderingSettings,
  orders,
} from "../src/db/schema";

const TAX_RATE_PERCENT = 8.25;

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function computeTotals(lineTotalsCents: number[]) {
  const subtotalCents = lineTotalsCents.reduce((sum, cents) => sum + cents, 0);
  const taxCents = Math.round(subtotalCents * (TAX_RATE_PERCENT / 100));
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

// Postgres preserves VALUES-list order in a multi-row INSERT ... RETURNING,
// so positional access here is safe; this just satisfies noUncheckedIndexedAccess.
function must<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Expected ${label} to be returned from insert`);
  return value;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  const db = createDb(databaseUrl);

  console.log("Seeding ordering_settings...");
  await db
    .insert(orderingSettings)
    .values({
      id: 1,
      isOrderingEnabled: true,
      estimatedPrepTimeMinutes: 20,
      taxRatePercent: TAX_RATE_PERCENT.toFixed(2),
      currency: "USD",
    })
    .onConflictDoNothing();

  console.log("Seeding menu categories + items...");
  const categoryRows = await db
    .insert(menuCategories)
    .values([
      { name: "Appetizers", sortOrder: 0 },
      { name: "Entrees", sortOrder: 1 },
      { name: "Beverages", sortOrder: 2 },
    ])
    .returning();
  const appetizers = must(categoryRows[0], "appetizers category");
  const entrees = must(categoryRows[1], "entrees category");
  const beverages = must(categoryRows[2], "beverages category");

  const itemRows = await db
    .insert(menuItems)
    .values([
      { categoryId: appetizers.id, name: "Spring Rolls", priceCents: 795, sortOrder: 0 },
      { categoryId: appetizers.id, name: "Buffalo Wings", priceCents: 1095, sortOrder: 1 },
      { categoryId: entrees.id, name: "Classic Burger", priceCents: 1495, sortOrder: 0 },
      { categoryId: entrees.id, name: "Grilled Salmon", priceCents: 2195, sortOrder: 1 },
      { categoryId: entrees.id, name: "Pasta Primavera", priceCents: 1695, sortOrder: 2 },
      { categoryId: beverages.id, name: "Lemonade", priceCents: 395, sortOrder: 0 },
      { categoryId: beverages.id, name: "Iced Tea", priceCents: 350, sortOrder: 1 },
      { categoryId: beverages.id, name: "Cola", priceCents: 325, isAvailable: false, sortOrder: 2 },
    ])
    .returning();
  const springRolls = must(itemRows[0], "spring rolls item");
  const wings = must(itemRows[1], "wings item");
  const burger = must(itemRows[2], "burger item");
  const salmon = must(itemRows[3], "salmon item");
  const pasta = must(itemRows[4], "pasta item");
  const lemonade = must(itemRows[5], "lemonade item");
  const iceTea = must(itemRows[6], "iced tea item");

  console.log("Seeding customers...");
  const customerRows = await db
    .insert(customers)
    .values([
      { name: "Alice Nguyen", email: "alice@example.com", phone: "555-0101" },
      { name: "Bob Martinez", email: "bob@example.com", phone: "555-0102" },
      { name: "Carol Smith", email: "carol@example.com" },
      { name: "Dave Okafor", email: "dave@example.com", phone: "555-0104" },
    ])
    .returning();
  const alice = must(customerRows[0], "alice customer");
  const bob = must(customerRows[1], "bob customer");
  const carol = must(customerRows[2], "carol customer");
  const dave = must(customerRows[3], "dave customer");

  console.log("Seeding orders + order items (one per status, plus history)...");

  type SeedOrder = {
    customerId: string;
    status: (typeof orders.$inferInsert)["status"];
    createdAt: Date;
    notes?: string;
    items: { item: typeof springRolls; quantity: number }[];
  };

  const seedOrders: SeedOrder[] = [
    {
      customerId: alice.id,
      status: "pending",
      createdAt: new Date(),
      items: [
        { item: burger, quantity: 1 },
        { item: lemonade, quantity: 1 },
      ],
    },
    {
      customerId: bob.id,
      status: "confirmed",
      createdAt: new Date(),
      items: [{ item: salmon, quantity: 2 }],
    },
    {
      customerId: carol.id,
      status: "preparing",
      createdAt: new Date(),
      items: [
        { item: wings, quantity: 1 },
        { item: iceTea, quantity: 2 },
      ],
    },
    {
      customerId: dave.id,
      status: "ready",
      createdAt: new Date(),
      items: [{ item: pasta, quantity: 1 }],
    },
    {
      customerId: alice.id,
      status: "completed",
      createdAt: daysAgo(2),
      items: [
        { item: springRolls, quantity: 2 },
        { item: burger, quantity: 1 },
      ],
    },
    {
      customerId: bob.id,
      status: "completed",
      createdAt: daysAgo(10),
      items: [{ item: salmon, quantity: 1 }],
    },
    {
      customerId: carol.id,
      status: "completed",
      createdAt: new Date(),
      items: [
        { item: burger, quantity: 2 },
        { item: lemonade, quantity: 2 },
      ],
    },
    {
      customerId: dave.id,
      status: "cancelled",
      createdAt: daysAgo(1),
      notes: "Customer requested cancellation",
      items: [{ item: wings, quantity: 1 }],
    },
  ];

  for (const seedOrder of seedOrders) {
    const lineItems = seedOrder.items.map(({ item, quantity }) => ({
      menuItemId: item.id,
      quantity,
      unitPriceCents: item.priceCents,
      lineTotalCents: item.priceCents * quantity,
    }));
    const totals = computeTotals(lineItems.map((li) => li.lineTotalCents));

    const orderRows = await db
      .insert(orders)
      .values({
        customerId: seedOrder.customerId,
        status: seedOrder.status,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        notes: seedOrder.notes,
        createdAt: seedOrder.createdAt,
        updatedAt: seedOrder.createdAt,
      })
      .returning();
    const order = must(orderRows[0], "inserted order");

    await db.insert(orderItems).values(
      lineItems.map((li) => ({
        orderId: order.id,
        ...li,
      })),
    );
  }

  console.log(`Seeded ${seedOrders.length} orders across every status.`);
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
