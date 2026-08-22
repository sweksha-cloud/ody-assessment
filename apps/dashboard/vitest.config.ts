import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    // Same substitution Expo's web bundler makes at build time — lets RN
    // primitives (View/Text/Pressable/...) render as real DOM nodes under
    // jsdom, so components can be tested without the native runtime.
    alias: {
      "react-native": "react-native-web",
    },
  },
});
