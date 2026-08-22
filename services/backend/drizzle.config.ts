import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Root .env is the reviewer-facing source of truth for these Node scripts
// (migrate/seed/gen-openapi) — wrangler dev reads DATABASE_URL from
// services/backend/.dev.vars separately (see README).
config({ path: "../../.env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
