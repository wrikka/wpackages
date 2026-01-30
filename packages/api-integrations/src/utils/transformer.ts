import {
	toCamelCase,
	toCamelCaseKeys,
	toSnakeCase,
	toSnakeCaseKeys,
	transformKeys,
} from "../components/case-transformer";
import { removeEmptyStrings, removeNullValues, removeUndefinedValues } from "../components/value-filter";
import type { FieldMapping, NormalizationOptions, SchemaMapping, TransformConfig } from "../types";

/**
 * Transformer utilities - Re-exports and additional functions
 */

// Re-export value filter functions
export { removeEmptyStrings, removeNullValues, removeUndefinedValues };

// Re-export case transformation functions
export { toCamelCase, toCamelCaseKeys, toSnakeCase, toSnakeCaseKeys, transformKeys };

/**
 * Trim string values in object
 */
export const trimStringValues = <T extends Record<string, unknown>>(
	obj: T,
): T => {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		acc[key as keyof T] = (
			typeof value === "string" ? value.trim() : value
		) as T[keyof T];
		return acc;
	}, {} as T);
};

/**
 * Apply transform config to object
 */
export const applyTransformConfig = <T extends Record<string, unknown>>(
	obj: T,
	config: TransformConfig,
): Record<string, unknown> => {
	let result: Record<string, unknown> = obj;

	if (config.removeNull) {
		result = removeNullValues(result);
	}

	if (config.removeUndefined) {
		result = removeUndefinedValues(result);
	}

	if (config.removeEmpty) {
		result = removeEmptyStrings(result);
	}

	if (config.camelCase) {
		result = toCamelCaseKeys(result);
	}

	if (config.snakeCase) {
		result = toSnakeCaseKeys(result);
	}

	if (config.trim) {
		result = trimStringValues(result);
	}

	return result;
};

/**
 * Map field from source to target
 */
export const mapField = (
	source: Record<string, unknown>,
	mapping: FieldMapping,
): unknown => {
	const value = source[mapping.source];

	if (value === undefined && mapping.defaultValue !== undefined) {
		return mapping.defaultValue;
	}

	if (mapping.transform) {
		const transformed = mapping.transform(value);
		return transformed.success ? transformed.value : undefined;
	}

	return value;
};

/**
 * Apply schema mapping
 */
export const applySchemaMapping = (
	source: Record<string, unknown>,
	schema: SchemaMapping,
): Record<string, unknown> => {
	const mapped = schema.fields.reduce(
		(acc, fieldMapping) => {
			const value = mapField(source, fieldMapping);

			if (fieldMapping.required && value === undefined) {
				throw new Error(`Required field ${fieldMapping.target} is missing`);
			}

			if (value !== undefined) {
				acc[fieldMapping.target] = value;
			}

			return acc;
		},
		{} as Record<string, unknown>,
	);

	if (schema.config) {
		return applyTransformConfig(mapped, schema.config);
	}

	return mapped;
};

/**
 * Normalize string
 */
export const normalizeString = (
	str: string,
	options: NormalizationOptions,
): string => {
	let result = str;

	if (options.trim) {
		result = result.trim();
	}

	if (options.lowercase) {
		result = result.toLowerCase();
	}

	if (options.uppercase) {
		result = result.toUpperCase();
	}

	if (options.removeWhitespace) {
		result = result.replace(/\s+/g, "");
	}

	if (options.removeSpecialChars) {
		result = result.replace(/[^a-zA-Z0-9\s]/g, "");
	}

	return result;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
	return JSON.parse(JSON.stringify(obj));
};

/**
 * Pick fields from object
 */
export const pick = <T extends Record<string, unknown>>(
	obj: T,
	fields: readonly (keyof T)[],
): Partial<T> => {
	return fields.reduce(
		(acc, field) => {
			if (field in obj) {
				acc[field] = obj[field];
			}
			return acc;
		},
		{} as Partial<T>,
	);
};

/**
 * Omit fields from object
 */
export const omit = <T extends Record<string, unknown>>(
	obj: T,
	fields: readonly (keyof T)[],
): Partial<T> => {
	const fieldsSet = new Set(fields);
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			if (!fieldsSet.has(key as keyof T)) {
				acc[key as keyof T] = value as T[keyof T];
			}
			return acc;
		},
		{} as Partial<T>,
	);
};

/**
 * Flatten nested object
 */
export const flatten = (
	obj: Record<string, unknown>,
	prefix = "",
): Record<string, unknown> => {
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			const newKey = prefix ? `${prefix}.${key}` : key;

			if (value && typeof value === "object" && !Array.isArray(value)) {
				const flattened = flatten(value as Record<string, unknown>, newKey);
				for (const key in flattened) {
					acc[key] = flattened[key];
				}
			} else {
				acc[newKey] = value;
			}

			return acc;
		},
		{} as Record<string, unknown>,
	);
};
