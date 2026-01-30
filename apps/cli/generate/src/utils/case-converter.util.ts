import type { CaseOptions, CaseStyle } from "../types";

/**
 * Convert string to PascalCase
 */
export const toPascalCase = (
	str: string,
	options: CaseOptions = {},
): string => {
	const words = splitWords(str);
	return words
		.map((word) => {
			if (options.preserveAcronyms && isAcronym(word)) {
				return word.toUpperCase();
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join("");
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string, options: CaseOptions = {}): string => {
	const pascal = toPascalCase(str, options);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str: string): string => {
	const words = splitWords(str);
	return words.map((word) => word.toLowerCase()).join("-");
};

/**
 * Convert string to snake_case
 */
export const toSnakeCase = (str: string): string => {
	const words = splitWords(str);
	return words.map((word) => word.toLowerCase()).join("_");
};

/**
 * Convert string to CONSTANT_CASE
 */
export const toConstantCase = (str: string): string => {
	const words = splitWords(str);
	return words.map((word) => word.toUpperCase()).join("_");
};

/**
 * Convert string to any case style
 */
export const convertCase = (
	str: string,
	style: CaseStyle,
	options: CaseOptions = {},
): string => {
	switch (style) {
		case "pascal":
			return toPascalCase(str, options);
		case "camel":
			return toCamelCase(str, options);
		case "kebab":
			return toKebabCase(str);
		case "snake":
			return toSnakeCase(str);
		case "constant":
			return toConstantCase(str);
		case "lower":
			return str.toLowerCase();
		case "upper":
			return str.toUpperCase();
	}
};

/**
 * Split string into words
 */
const splitWords = (str: string): string[] => {
	return str
		.replace(/([a-z])([A-Z])/g, "$1 $2") // PascalCase/camelCase
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Acronyms
		.replace(/[_-]/g, " ") // snake_case, kebab-case
		.split(/\s+/)
		.filter(Boolean);
};

/**
 * Check if word is an acronym (all uppercase)
 */
const isAcronym = (word: string): boolean => {
	return word.length > 1 && word === word.toUpperCase();
};
