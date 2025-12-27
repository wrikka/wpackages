/**
 * Common utilities
 */

import type { Result, Schema } from "../types";

export const createSchema = <T, I = T>(
	validate: (input: unknown, ctx: any) => void | Result<T>,
	metadata?: { name?: string },
): Schema<I, T> => {
	return {
		parse: (input: unknown, context?: any) => {
			const ctx = { ...context, issues: [], data: undefined };
			const result = validate(input, ctx);
			if (result) {
				return result;
			}
			if (ctx.issues.length > 0) {
				return { success: false, issues: ctx.issues };
			}
			return { success: true, data: ctx.data };
		},
		_metadata: metadata || {},
		_input: undefined as any,
		_output: undefined as any,
	};
};

export const createError = (message: string, path?: string[]) => ({
	message,
	path: path || [],
});

export const prefixErrorPath = (error: any, prefix: string) => ({
	...error,
	path: [prefix, ...(error.path || [])],
});

export const isArray = (value: unknown): value is unknown[] =>
	Array.isArray(value);
