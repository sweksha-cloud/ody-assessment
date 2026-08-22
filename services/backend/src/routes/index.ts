import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../env";
import { customerRoutes } from "./customers";
import { healthRoutes } from "./health";
import { kpiRoutes } from "./kpis";
import { menuRoutes } from "./menu";
import { orderRoutes } from "./orders";
import { settingsRoutes } from "./settings";

export const routes = new OpenAPIHono<AppEnv>()
  .route("/", healthRoutes)
  .route("/", menuRoutes)
  .route("/", customerRoutes)
  .route("/", orderRoutes)
  .route("/", settingsRoutes)
  .route("/", kpiRoutes);
