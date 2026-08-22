import { customers, menuCategories, menuItems, orderingSettings } from "../src/db/schema";
import type { TestDb } from "./testDb";

export async function seedBaseFixtures(db: TestDb) {
  await db.insert(orderingSettings).values({
    id: 1,
    isOrderingEnabled: true,
    estimatedPrepTimeMinutes: 20,
    taxRatePercent: "10.00",
    currency: "USD",
  });

  const [category] = await db
    .insert(menuCategories)
    .values({ name: "Entrees", sortOrder: 0 })
    .returning();
  if (!category) throw new Error("category insert returned no row");

  const [availableItem, unavailableItem] = await db
    .insert(menuItems)
    .values([
      { categoryId: category.id, name: "Burger", priceCents: 1000, isAvailable: true },
      { categoryId: category.id, name: "Discontinued Soup", priceCents: 500, isAvailable: false },
    ])
    .returning();
  if (!availableItem || !unavailableItem) throw new Error("menu item insert returned too few rows");

  const [customer] = await db
    .insert(customers)
    .values({ name: "Alice Nguyen", email: "alice@example.com" })
    .returning();
  if (!customer) throw new Error("customer insert returned no row");

  return { category, availableItem, unavailableItem, customer };
}
