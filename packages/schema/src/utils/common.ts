/**
 * Common utilities
 */

import type { Result, Schema, ValidationContext, Issue } from "../types";

// The context object used during validation.
// It's intentionally extensible with `[key: string]: any` to allow for custom properties.
// biome-ignore lint/suspicious/noExplicitAny: This is a flexible context object.
type InternalValidationContext = ValidationContext & { issues: Issue[]; data?: any };

export const createSchema = <T, I = T>(
	validate: (input: unknown, ctx: InternalValidationContext) => void | Result<T>,
	metadata?: { name?: string },
): Schema<I, T> => {
	return {
		parse: (input: unknown, context?: Partial<ValidationContext>) => {
			const ctx: InternalValidationContext = { issues: [], data: undefined, path: [], ...context };
			const result = validate(input, ctx);
			if (result) {
				return result;
			}
			if (ctx.issues.length > 0) {
				return { success: false, issues: ctx.issues };
			}
			return { success: true, data: ctx.data as T };
		},
		_metadata: metadata || {},
		_input: undefined as I,
		_output: undefined as T,
	};
};

export const createError = (message: string, path?: (string | number)[]): Issue => ({
	message,
	path: path || [],
});

export const prefixErrorPath = (error: Issue, prefix: string): Issue => ({
	...error,
	path: [prefix, ...(error.path || [])],
});

export const isArray = (value: unknown): value is unknown[] =>
	Array.isArray(value);
