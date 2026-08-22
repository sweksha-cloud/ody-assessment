// Money is stored as integer cents throughout (see the Drizzle schema) —
// this is the one place cents get formatted for display, shared by both apps.
export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
