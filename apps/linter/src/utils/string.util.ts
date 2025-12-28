/**
 * String utilities - Pure functions for string manipulation
 */

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (str: string): boolean => str.trim().length === 0;

/**
 * Check if string is not empty
 */
export const isNotEmpty = (str: string): boolean => str.trim().length > 0;

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string =>
	str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Convert to kebab-case
 */
export const toKebabCase = (str: string): string =>
	str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();

/**
 * Convert to camelCase
 */
export const toCamelCase = (str: string): string =>
	str
		.replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
		.replace(/^[A-Z]/, (char) => char.toLowerCase());

/**
 * Truncate string to specified length
 */
export const truncate = (
	str: string,
	length: number,
	suffix = "...",
): string =>
	str.length > length ? str.slice(0, length - suffix.length) + suffix : str;

/**
 * Escape regex special characters
 */
export const escapeRegex = (str: string): string =>
	str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Remove line numbers from string (e.g., "1: " prefix)
 */
export const removeLineNumbers = (str: string): string =>
	str.replace(/^\d+:\s*/gm, "");

/**
 * Extract file extension
 */
export const getFileExtension = (path: string): string => {
	const match = path.match(/\.([^.]+)$/);
	return match?.[1] ?? "";
};

/**
 * Check if path has specific extension
 */
export const hasExtension = (path: string, ext: string): boolean =>
	getFileExtension(path).toLowerCase() === ext.toLowerCase();
