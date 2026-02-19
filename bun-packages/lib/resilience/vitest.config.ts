import { resolve } from "path";
import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "resilience",
		globals: true,
		environment: "node",
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist"],
		setupFiles: [],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
