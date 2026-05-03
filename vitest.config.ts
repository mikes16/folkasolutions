import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the `@/*` -> `./src/*` alias from tsconfig.json so tests
      // can import application code with the same paths used by Next.js.
      "@": resolve(projectRoot, "src"),
    },
  },
  test: {
    // Default to node; individual test files can opt into jsdom via
    // `// @vitest-environment jsdom` when component tests are introduced.
    environment: "node",
    // Prefer explicit imports of describe/it/expect from "vitest" over
    // global injection (matches the project's explicit-over-implicit rule).
    globals: false,
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
    exclude: [
      "node_modules/**",
      ".next/**",
      "dist/**",
    ],
  },
});
