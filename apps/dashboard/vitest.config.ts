import { fileURLToPath } from "node:url";
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
    alias: {
      // Same substitution Expo's web bundler makes at build time — lets
      // RN primitives (View/Text/Pressable/...) render as real DOM nodes
      // under jsdom, so components can be tested without the native
      // runtime.
      "react-native": "react-native-web",
      // Native-module packages (SVG rendering, gradient fills) — their
      // real builds pull in Fabric/Paper native component registrations
      // and ESM-only transitive deps jsdom can't load and has no use for
      // anyway, since no test here asserts actual pixel output. Local
      // stand-ins keep component behavior (layout, children, props)
      // testable without that dependency chain.
      "react-native-svg": fileURLToPath(new URL("./test/mocks/reactNativeSvg.tsx", import.meta.url)),
      "expo-linear-gradient": fileURLToPath(new URL("./test/mocks/expoLinearGradient.tsx", import.meta.url)),
    },
  },
});
