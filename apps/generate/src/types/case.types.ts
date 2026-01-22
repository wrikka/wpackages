/**
 * String case transformation styles
 */
export type CaseStyle =
	| "pascal" // PascalCase
	| "camel" // camelCase
	| "kebab" // kebab-case
	| "snake" // snake_case
	| "constant" // CONSTANT_CASE
	| "lower" // lowercase
	| "upper"; // UPPERCASE

/**
 * Case conversion options
 */
export interface CaseOptions {
	/** Preserve acronyms in uppercase */
	readonly preserveAcronyms?: boolean;
	/** Custom separator for compound words */
	readonly separator?: string;
}
