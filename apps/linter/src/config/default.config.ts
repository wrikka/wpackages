/**
 * Default linter configuration
 */

import type { LinterOptions } from "../types";

export const DEFAULT_CONFIG: LinterOptions = {
	rules: {
		// Best Practices
		"no-console": "warning",
		"no-debugger": "error",
		"no-var": "error",
		"prefer-const": "warning",

		// Security
		"no-eval": "error",

		// TypeScript Specific
		"no-explicit-any": "warning",
		"prefer-readonly": "info",

		// Functional Programming (unique to lint)
		"no-mutation": "warning",
		"no-null": "warning",
		"prefer-arrow-function": "info",
	},
	fix: false,
	ignore: [
		"node_modules/**",
		"dist/**",
		"build/**",
		"coverage/**",
		"**/*.min.js",
		"**/*.bundle.js",
	],
	extensions: [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"],
} as const;
