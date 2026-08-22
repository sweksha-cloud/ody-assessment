import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { OpenAPIHono } from "@hono/zod-openapi";
import * as schema from "../src/db/schema";
import type { AppEnv } from "../src/env";
import { routes } from "../src/routes";

// Real, ephemeral Postgres (via PGlite/WASM) migrated with the same SQL the
// production database runs — not a hand-rolled mock — so tests exercise
// real FK/enum/check constraints, not an approximation of them.
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });

  // The neon-http driver (production) supports db.batch() instead of
  // db.transaction(); PGlite supports real transactions but not .batch().
  // This shim gives route handlers the same .batch() surface, sequentially
  // awaited so FK-dependent inserts (customer -> order -> order items)
  // still land in the right order.
  (db as unknown as { batch: <T extends readonly unknown[]>(queries: T) => Promise<unknown[]> }).batch = async (
    queries,
  ) => {
    const results = [];
    for (const query of queries) results.push(await query);
    return results;
  };

  return db;
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

export function createTestApp(db: TestDb) {
  const app = new OpenAPIHono<AppEnv>();
  app.use("*", async (c, next) => {
    // PGlite's drizzle instance is structurally compatible with the routes'
    // query/insert/update/query.findMany/batch usage; AppEnv is typed
    // against the neon-http instance since that's what production uses.
    c.set("db", db as AppEnv["Variables"]["db"]);
    await next();
  });
  app.route("/", routes);
  return app;
}
