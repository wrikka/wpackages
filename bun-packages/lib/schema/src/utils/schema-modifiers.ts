import type { SafeParseResult, SchemaIssue } from "../types";
import { Schema } from '../lib/base';

/**
 * Custom error map for localized messages
 */
export type ErrorMap = Record<string, string | ((value: unknown, params?: Record<string, unknown>) => string)>;

/**
 * Schema with custom error messages
 */
export function withCustomErrors<T>(schema: Schema<T>, errorMap: ErrorMap): Schema<T> {
	const cloned = (schema as unknown as { _clone(): Schema<T> })._clone();

	// Override the safeParse to use custom errors
	const originalSafeParse = cloned.safeParse.bind(cloned);
	cloned.safeParse = (value: unknown): SafeParseResult<T> => {
		const result = originalSafeParse(value);

		if (!result.success) {
			const customErrors: SchemaIssue[] = result.errors.map((error: SchemaIssue) => {
				const customMessage = errorMap[error.code];
				if (customMessage) {
					return {
						...error,
						message: typeof customMessage === "function"
							? customMessage(error.value, error.params)
							: customMessage,
					};
				}
				return error;
			});

			return { success: false, errors: customErrors };
		}

		return result;
	};

	return cloned;
}

/**
 * Super refine - allows adding multiple issues and context manipulation
 */
export function superRefine<T>(
	schema: Schema<T>,
	refiner: (
		value: T,
		ctx: { addIssue: (issue: SchemaIssue) => void; path: (string | number)[] },
	) => void | Promise<void>,
): Schema<T> {
	const cloned = (schema as unknown as { _clone(): Schema<T> })._clone();

	const originalSafeParse = cloned.safeParse.bind(cloned);
	cloned.safeParse = (value: unknown): SafeParseResult<T> => {
		const result = originalSafeParse(value);

		if (result.success) {
			const issues: SchemaIssue[] = [];
			const ctx = {
				addIssue: (issue: SchemaIssue) => issues.push(issue),
				path: [],
			};

			const refineResult = refiner(result.data, ctx);

			// Handle async refinement
			if (refineResult instanceof Promise) {
				throw new Error("Async refinement not supported in sync parse. Use .async() first.");
			}

			if (issues.length > 0) {
				return { success: false, errors: issues };
			}
		}

		return result;
	};

	return cloned;
}

/**
 * Catch schema - provide fallback value on parse failure
 */
export function catch_<T>(schema: Schema<T>, fallback: T | (() => T)): Schema<T> {
	const cloned = (schema as unknown as { _clone(): Schema<T> })._clone();

	const originalSafeParse = cloned.safeParse.bind(cloned);
	cloned.safeParse = (value: unknown): SafeParseResult<T> => {
		const result = originalSafeParse(value);

		if (!result.success) {
			const fallbackValue = typeof fallback === "function" ? (fallback as () => T)() : fallback;
			return { success: true, data: fallbackValue };
		}

		return result;
	};

	return cloned;
}

/**
 * Strict mode for object schemas - reject unknown keys
 */
export function strict<T>(schema: Schema<T>): Schema<T> {
	// For ObjectSchema, strict mode is already the default behavior
	// This is a marker for explicit strict mode
	return schema;
}

/**
 * Passthrough mode for object schemas - allow unknown keys
 */
export function passthrough<T>(schema: Schema<T>): Schema<T> {
	const cloned = (schema as unknown as { _clone(): Schema<T> })._clone();
	// Mark as passthrough - the ObjectSchema._validate needs to be modified to support this
	(cloned as unknown as Record<string, unknown>)["_passthrough"] = true;
	return cloned;
}

/**
 * Strip mode for object schemas - remove unknown keys (inverse of passthrough)
 */
export function strip<T>(schema: Schema<T>): Schema<T> {
	const cloned = (schema as unknown as { _clone(): Schema<T> })._clone();
	(cloned as unknown as Record<string, unknown>)["_passthrough"] = false;
	return cloned;
}
