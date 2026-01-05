import type { CoverageConfig } from "./types";

export function createDefaultCoverageConfig(): CoverageConfig {
	return {
		excludePatterns: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"**/coverage/**",
			"**/*.test.{ts,js,mjs,cjs}",
			"**/*.spec.{ts,js,mjs,cjs}",
			"**/test/**",
			"**/tests/**",
			"**/__tests__/**",
			"**/*.d.ts",
			"**/*.config.{js,ts}",
		],
		includePatterns: ["src/**/*.{ts,js,mjs,cjs}"],
		thresholds: {
			lines: 80,
			functions: 80,
			branches: 80,
			statements: 80,
		},
		thresholdGlobal: {
			lines: 80,
			functions: 80,
			branches: 80,
			statements: 80,
		},
		thresholdFile: {
			lines: 0,
			functions: 0,
			branches: 0,
			statements: 0,
		},
		reporters: ["text", "lcov"],
		outputDir: "coverage",
		all: false,
		only: false,
	};
}
