import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "html", "lcov"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.d.ts",
				"**/*.test.ts",
				"**/index.ts",
				"vitest.config.ts",
				"coverage/",
			],
		},
		pool: "forks",
		maxWorkers: 1,
	},
});
