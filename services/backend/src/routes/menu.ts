import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { menuCategories, menuItems } from "../db/schema";
import { firstOrThrow } from "../db/util";
import type { AppEnv } from "../env";
import { MenuCategorySchema, MenuItemSchema } from "../openapi-schemas";

const ErrorSchema = z.object({ error: z.string() });
const IdParamSchema = z.object({ id: z.string().uuid() });

const CategorySchema = MenuCategorySchema;
const CreateCategorySchema = MenuCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateMenuCategory");
const UpdateCategorySchema = CreateCategorySchema.partial().openapi("UpdateMenuCategory");

const CreateMenuItemSchema = MenuItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).openapi("CreateMenuItem");
const UpdateMenuItemSchema = CreateMenuItemSchema.partial().openapi("UpdateMenuItem");

export const menuRoutes = new OpenAPIHono<AppEnv>();

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "get",
    path: "/menu/categories",
    responses: {
      200: {
        content: { "application/json": { schema: z.array(CategorySchema) } },
        description: "List menu categories",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const rows = await db.select().from(menuCategories).orderBy(menuCategories.sortOrder);
    return c.json(rows, 200);
  },
);

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "post",
    path: "/menu/categories",
    request: { body: { content: { "application/json": { schema: CreateCategorySchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: CategorySchema } },
        description: "Category created",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");
    const row = firstOrThrow(await db.insert(menuCategories).values(body).returning());
    return c.json(row, 201);
  },
);

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "patch",
    path: "/menu/categories/{id}",
    request: {
      params: IdParamSchema,
      body: { content: { "application/json": { schema: UpdateCategorySchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: CategorySchema } },
        description: "Category updated",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Category not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuCategories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuCategories.id, id))
      .returning();
    if (!row) return c.json({ error: "Category not found" }, 404);
    return c.json(row, 200);
  },
);

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "get",
    path: "/menu/items",
    request: { query: z.object({ categoryId: z.string().uuid().optional() }) },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(MenuItemSchema) } },
        description: "List menu items",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { categoryId } = c.req.valid("query");
    const rows = await db
      .select()
      .from(menuItems)
      .where(categoryId ? eq(menuItems.categoryId, categoryId) : undefined)
      .orderBy(menuItems.sortOrder);
    return c.json(rows, 200);
  },
);

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "post",
    path: "/menu/items",
    request: { body: { content: { "application/json": { schema: CreateMenuItemSchema } } } },
    responses: {
      201: {
        content: { "application/json": { schema: MenuItemSchema } },
        description: "Menu item created",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const body = c.req.valid("json");
    const row = firstOrThrow(await db.insert(menuItems).values(body).returning());
    return c.json(row, 201);
  },
);

menuRoutes.openapi(
  createRoute({
    tags: ["Menu"],
    method: "patch",
    path: "/menu/items/{id}",
    request: {
      params: IdParamSchema,
      body: { content: { "application/json": { schema: UpdateMenuItemSchema } } },
    },
    responses: {
      200: {
        content: { "application/json": { schema: MenuItemSchema } },
        description: "Menu item updated (also used to soft-delete via isAvailable: false)",
      },
      404: {
        content: { "application/json": { schema: ErrorSchema } },
        description: "Menu item not found",
      },
    },
  }),
  async (c) => {
    const db = c.get("db");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) return c.json({ error: "Menu item not found" }, 404);
    return c.json(row, 200);
  },
);
