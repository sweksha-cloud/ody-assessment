import type { createDb } from "./db/client";

export type Bindings = {
  DATABASE_URL: string;
};

export type Variables = {
  db: ReturnType<typeof createDb>;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };
