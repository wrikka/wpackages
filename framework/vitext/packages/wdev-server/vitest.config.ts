import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{ts,js}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.d.ts",
				"**/*.test.{ts,js}",
				"**/*.spec.{ts,js}",
				"**/index.ts",
				"vitest.config.ts",
			],
		},
	},
});
