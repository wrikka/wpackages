import react from "@vitejs/plugin-react";
import tsconfigPaths from "vitest-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		deps: {
			hints: false,
		},
	},
	resolve: {
		alias: {
			"./jsx-dev-runtime": "react/jsx-dev-runtime",
			"./jsx-runtime": "react/jsx-runtime",
		},
	},
});
