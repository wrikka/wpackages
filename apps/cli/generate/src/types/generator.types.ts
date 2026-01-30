import type { CaseStyle } from "./case.types";

/**
 * Generator configuration options
 */
export interface GeneratorOptions {
	/** Output directory path */
	readonly outputDir: string;
	/** Whether to overwrite existing files */
	readonly overwrite?: boolean;
	/** Whether to format generated files */
	readonly format?: boolean;
	/** Custom template variables */
	readonly variables?: Record<string, unknown>;
	/** File name case style */
	readonly caseStyle?: CaseStyle;
	/** Dry run mode (don't write files) */
	readonly dryRun?: boolean;
}

/**
 * Template rendering context
 */
export interface TemplateContext {
	/** Template variables */
	readonly variables: Record<string, unknown>;
	/** Helper functions available in templates */
	readonly helpers: TemplateHelpers;
}

/**
 * Template helper functions
 */
export interface TemplateHelpers {
	/** Convert to PascalCase */
	readonly pascal: (str: string) => string;
	/** Convert to camelCase */
	readonly camel: (str: string) => string;
	/** Convert to kebab-case */
	readonly kebab: (str: string) => string;
	/** Convert to snake_case */
	readonly snake: (str: string) => string;
	/** Convert to CONSTANT_CASE */
	readonly constant: (str: string) => string;
	/** Pluralize a word */
	readonly plural: (str: string) => string;
	/** Singularize a word */
	readonly singular: (str: string) => string;
}
