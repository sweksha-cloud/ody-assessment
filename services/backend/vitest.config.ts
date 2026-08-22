import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // PGlite's WASM boot is slower than a plain node test; give it room.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
