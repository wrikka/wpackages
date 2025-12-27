/**
 * Value filter utilities - Pure functions for filtering object values
 * Reduces code duplication in transformer functions
 */

/**
 * Generic value filter - filters object entries based on predicate
 */
export const filterValues = <T extends Record<string, unknown>>(
	obj: T,
	predicate: (value: unknown) => boolean,
): Partial<T> => {
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			if (predicate(value)) {
				acc[key as keyof T] = value as T[keyof T];
			}
			return acc;
		},
		{} as Partial<T>,
	);
};

/**
 * Remove null values from object
 */
export const removeNullValues = <T extends Record<string, unknown>>(
	obj: T,
): Partial<T> => filterValues(obj, (value) => value !== null);

/**
 * Remove undefined values from object
 */
export const removeUndefinedValues = <T extends Record<string, unknown>>(
	obj: T,
): Partial<T> => filterValues(obj, (value) => value !== undefined);

/**
 * Remove empty strings from object
 */
export const removeEmptyStrings = <T extends Record<string, unknown>>(
	obj: T,
): Partial<T> => filterValues(obj, (value) => value !== "");

/**
 * Remove falsy values from object
 */
export const removeFalsyValues = <T extends Record<string, unknown>>(
	obj: T,
): Partial<T> => filterValues(obj, (value) => Boolean(value));

/**
 * Keep only specified keys from object
 */
export const pickKeys = <T extends Record<string, unknown>>(
	obj: T,
	keys: readonly (keyof T)[],
): Partial<T> => {
	const keySet = new Set(keys);
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			if (keySet.has(key as keyof T)) {
				acc[key as keyof T] = value as T[keyof T];
			}
			return acc;
		},
		{} as Partial<T>,
	);
};

/**
 * Omit specified keys from object
 */
export const omitKeys = <T extends Record<string, unknown>>(
	obj: T,
	keys: readonly (keyof T)[],
): Partial<T> => {
	const keySet = new Set(keys);
	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			if (!keySet.has(key as keyof T)) {
				acc[key as keyof T] = value as T[keyof T];
			}
			return acc;
		},
		{} as Partial<T>,
	);
};
