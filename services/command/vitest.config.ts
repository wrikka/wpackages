import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@wpackages/functional": fileURLToPath(new URL("../../packages/functional/src", import.meta.url)),
		},
	},
	test: {
		name: "command",
		environment: "node",
		include: ["src/**/*.test.ts"],
	},
});
