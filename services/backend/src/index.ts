import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { createDb } from "./db/client";
import type { AppEnv } from "./env";
import { routes } from "./routes";

const app = new OpenAPIHono<AppEnv>();

app.use("*", cors());
app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DATABASE_URL));
  await next();
});
app.route("/", routes);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "ServiceLine Backend API",
    version: "0.1.0",
  },
});

export default app;
export { app };
