import { err, ok } from "@wpackages/functional";
import type { EnvSchema, ParsedEnv, Result } from "../../types/env";
import { castValue } from "../../utils";

export const get = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
): T[K] | undefined => {
	const value = envData[key as string];

	if (value === undefined) return undefined;

	if (schema && schema[key]) {
		const definition = schema[key];

		// Apply transform
		if (definition.transform) {
			return definition.transform(value) as T[K];
		}

		// Cast to type
		return castValue<T[K]>(value, definition.type);
	}

	return value as T[K];
};

export const getRequired = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
): Result<T[K], Error> => {
	const value = get(envData, schema, key);

	if (value === undefined) {
		return err(
			new Error(`Required environment variable '${String(key)}' is not set`),
		) as Result<T[K], Error>;
	}

	return ok(value) as Result<T[K], Error>;
};

export const getAll = <T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
): T => {
	const result: Record<string, unknown> = {};

	if (schema) {
		for (const key of Object.keys(schema)) {
			result[key] = get(envData, schema, key as keyof T);
		}
	} else {
		Object.assign(result, envData);
	}

	return result as T;
};

export const getString = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
	defaultValue?: string,
): string => {
	const value = get(envData, schema, key);
	return value !== undefined ? String(value) : defaultValue || "";
};

export const getNumber = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
	defaultValue?: number,
): number => {
	const value = get(envData, schema, key);
	const num = Number(value);
	return value !== undefined && !isNaN(num) ? num : defaultValue || 0;
};

export const getBoolean = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
	defaultValue?: boolean,
): boolean => {
	const value = get(envData, schema, key);
	if (value === undefined) return defaultValue || false;

	const str = String(value).toLowerCase();
	return str === "true" || str === "1" || str === "yes" || str === "on";
};

export const getArray = <T, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
	separator = ",",
): string[] => {
	const value = get(envData, schema, key);
	return value
		? String(value)
			.split(separator)
			.map((v) => v.trim())
		: [];
};

export const getJson = <J = unknown, T = Record<string, unknown>, K extends keyof T>(
	envData: ParsedEnv,
	schema: EnvSchema<T> | undefined,
	key: K,
): J | undefined => {
	const value = get(envData, schema, key);
	if (!value) return undefined;

	try {
		return JSON.parse(String(value)) as J;
	} catch {
		return undefined;
	}
};
