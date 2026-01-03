import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		root: "src",
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
});
