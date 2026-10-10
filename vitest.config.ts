import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import "dotenv/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: { reporter: ["text", "html"] },
  },
});
