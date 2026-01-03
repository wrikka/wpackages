import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		// Vitest will not be able to resolve workspace dependencies
		// without this setting.
		deps: {
			interopDefault: true,
		},
	},
});
