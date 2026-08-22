import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    timestamp: z.string().datetime(),
  })
  .openapi("HealthResponse");

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
      description: "Service health check",
    },
  },
});

export const healthRoutes = new OpenAPIHono().openapi(healthRoute, (c) => {
  return c.json({ status: "ok" as const, timestamp: new Date().toISOString() }, 200);
});
