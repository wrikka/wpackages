export const DEFAULT_EXCLUDE_PATTERNS = [
	"node_modules/**",
	"dist/**",
	"build/**",
	".git/**",
	".turbo/**",
	"**/*.test.ts",
	"**/*.spec.ts",
] as const;

export const DEFAULT_INCLUDE_PATTERNS = [
	"**/*.ts",
	"**/*.tsx",
	"**/*.js",
	"**/*.jsx",
] as const;

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_MAX_COMPLEXITY = 20;
export const DEFAULT_MAX_CONCURRENCY = 4;

export const CHECK_NAMES = {
	circular: "Circular Dependencies",
	complexity: "Code Complexity",
	deps: "Dependencies",
	depsUpdate: "Dependencies Update",
	duplicates: "Duplicate Code",
	imports: "Imports",
	security: "Security",
	sideEffect: "Side Effects",
	size: "File Size",
	type: "Type Check",
	typeSafe: "Type Safety",
	unused: "Unused Code",
} as const;

export const SEVERITY_SYMBOLS = {
	error: "✖",
	info: "ℹ",
	warning: "⚠",
} as const;

export const STATUS_SYMBOLS = {
	failed: "✖",
	passed: "✔",
	skipped: "○",
} as const;
