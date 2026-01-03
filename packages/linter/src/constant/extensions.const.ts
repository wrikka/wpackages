/**
 * File extension constants
 */

export const TYPESCRIPT_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"] as const;

export const JAVASCRIPT_EXTENSIONS = [".js", ".jsx", ".mjs", ".cjs"] as const;

export const ALL_EXTENSIONS = [
	...TYPESCRIPT_EXTENSIONS,
	...JAVASCRIPT_EXTENSIONS,
] as const;

export const IGNORE_DIRECTORIES = [
	"node_modules",
	"dist",
	"build",
	"coverage",
	".next",
	".nuxt",
	".turbo",
	".git",
] as const;

export const isTypeScriptFile = (filename: string): boolean =>
	TYPESCRIPT_EXTENSIONS.some((ext) => filename.endsWith(ext));

export const isJavaScriptFile = (filename: string): boolean =>
	JAVASCRIPT_EXTENSIONS.some((ext) => filename.endsWith(ext));

export const isJsxFile = (filename: string): boolean => filename.endsWith(".tsx") || filename.endsWith(".jsx");
