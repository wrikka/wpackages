/**
 * Case transformation utilities - Pure functions for key case conversion
 * Converts between camelCase, snake_case, PascalCase, etc.
 */

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string): string => {
	return str
		.toLowerCase()
		.replace(/[_-](.)/g, (_, char) => char.toUpperCase());
};

/**
 * Convert string to snake_case
 */
export const toSnakeCase = (str: string): string => {
	return str
		.replace(/([a-z])([A-Z])/g, "$1_$2")
		.replace(/[_-]+/g, "_")
		.toLowerCase();
};

/**
 * Convert string to PascalCase
 */
export const toPascalCase = (str: string): string => {
	return str
		.split(/[_-]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str: string): string => {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[_]+/g, "-")
		.toLowerCase();
};

/**
 * Transform object keys using a transformation function
 */
export const transformKeys = <T extends Record<string, unknown>>(
	obj: T,
	transformer: (key: string) => string,
): Record<string, unknown> => {
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			acc[transformer(key)] = value;
			return acc;
		},
		{} as Record<string, unknown>,
	);
};

/**
 * Convert object keys to camelCase
 */
export const toCamelCaseKeys = <T extends Record<string, unknown>>(
	obj: T,
): Record<string, unknown> => transformKeys(obj, toCamelCase);

/**
 * Convert object keys to snake_case
 */
export const toSnakeCaseKeys = <T extends Record<string, unknown>>(
	obj: T,
): Record<string, unknown> => transformKeys(obj, toSnakeCase);

/**
 * Convert object keys to PascalCase
 */
export const toPascalCaseKeys = <T extends Record<string, unknown>>(
	obj: T,
): Record<string, unknown> => transformKeys(obj, toPascalCase);

/**
 * Convert object keys to kebab-case
 */
export const toKebabCaseKeys = <T extends Record<string, unknown>>(
	obj: T,
): Record<string, unknown> => transformKeys(obj, toKebabCase);
