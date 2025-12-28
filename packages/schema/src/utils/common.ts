/**
 * Common utilities
 */

import type { Issue, Result, Schema, ValidationContext } from "../types";
import { createSchema as createSchemaWithTransform } from "./create-schema";

// The context object used during validation.
// It's intentionally extensible with `[key: string]: any` to allow for custom properties.
type InternalValidationContext = ValidationContext & {
	issues: Issue[];
	data?: unknown;
};

export const createSchema = <T, I = T>(
	validate: (
		input: unknown,
		ctx: InternalValidationContext,
	) => undefined | Result<T>,
	metadata?: { name?: string },
): Schema<I, T> => {
	return createSchemaWithTransform({
		parse: (input: unknown, context?: Partial<ValidationContext>) => {
			const ctx: InternalValidationContext = {
				issues: [],
				data: undefined,
				path: [],
				...context,
			};
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
	});
};

export const createError = (
	message: string,
	path?: (string | number)[],
): Issue => ({
	message,
	path: path || [],
});

export const prefixErrorPath = (error: Issue, prefix: string): Issue => ({
	...error,
	path: [prefix, ...(error.path || [])],
});

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
