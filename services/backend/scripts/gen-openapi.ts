import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "../src/index";

const scriptDir = dirname(fileURLToPath(import.meta.url));

const document = app.getOpenAPIDocument({
  openapi: "3.1.0",
  info: {
    title: "ServiceLine Backend API",
    version: "0.1.0",
  },
});

const outPath = resolve(scriptDir, "../openapi.json");
writeFileSync(outPath, JSON.stringify(document, null, 2));

console.log(`Wrote OpenAPI spec to ${outPath}`);
