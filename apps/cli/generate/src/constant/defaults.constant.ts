import type { GeneratorOptions } from "../types";

/**
 * Default generator options
 */
export const DEFAULT_GENERATOR_OPTIONS: Readonly<
	Required<Omit<GeneratorOptions, "outputDir">>
> = {
	overwrite: false,
	format: true,
	variables: {},
	caseStyle: "kebab",
	dryRun: false,
} as const;

/**
 * Supported file extensions for generation
 */
export const SUPPORTED_EXTENSIONS = [
	".ts",
	".tsx",
	".js",
	".jsx",
	".json",
	".md",
	".yml",
	".yaml",
] as const;

/**
 * Template variable pattern for replacement
 */
export const TEMPLATE_VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

/**
 * Template helper function pattern
 */
export const TEMPLATE_HELPER_PATTERN = /\{\{\s*(\w+)\s+(\w+)\s*\}\}/g;
