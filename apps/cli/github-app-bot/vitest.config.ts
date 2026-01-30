import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@wpackages/functional": fileURLToPath(new URL("../../packages/functional/src", import.meta.url)),
			"@wpackages/github": fileURLToPath(new URL("../github/src", import.meta.url)),
		},
	},
	test: {
		name: "github-app-bot",
		environment: "node",
		include: ["src/**/*.test.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "html"],
		},
	},
});
