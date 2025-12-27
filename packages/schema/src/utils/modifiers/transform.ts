/**
 * Transform Schema
 *
 * Transform validated values to another type
 */

import { addIssue } from "../../errors";
import type { Schema, SchemaOptions } from "../../types";
import { createSchema } from "../../utils";

/**
 * Transform a schema's output
 *
 * @param schema - Base schema
 * @param fn - Transformation function
 * @param options - Schema options
 * @returns Transformed schema
 *
 * @example
 * ```ts
 * const stringToNumber = transform(
 *   string(),
 *   (s) => Number(s)
 * );
 * ```
 */
export const transform = <I, O, T>(
	schema: Schema<I, O>,
	fn: (value: O) => T,
	options: SchemaOptions = {},
): Schema<I, T> => {
	return createSchema<I, T>(
		(input, ctx) => {
			const result = schema.parse(input);
			if (!result.success) {
				// Forward errors
				result.issues.forEach(issue => addIssue(ctx, issue));
				return;
			}
			try {
				const transformed = fn(result.data);
				ctx.data = transformed;
			} catch (error) {
				addIssue(ctx, {
					code: "transformation_error",
					message: options.message
						|| `Transformation failed: ${error instanceof Error ? error.message : String(error)}`,
				});
			}
			return { success: true, data: ctx.data };
		},
		{
			...(options.name !== undefined ? { name: options.name } : {}),
			...(schema._metadata.name !== undefined ? { name: schema._metadata.name } : {}),
		},
	) as unknown as Schema<I, T>;
};

/**
 * Default value if input is undefined
 *
 * @param schema - Base schema
 * @param defaultValue - Default value or function to compute default
 * @returns Schema with default value
 *
 * @example
 * ```ts
 * const withDefaultString = withDefault(string(), 'default');
 * const withComputedDefault = withDefault(number(), () => Date.now());
 * ```
 */
export const withDefault = <I, O>(
	schema: Schema<I, O>,
	defaultValue: O | (() => O),
): Schema<I | undefined, O> => {
	return createSchema<I | undefined, O>(
		(input, ctx) => {
			if (input === undefined) {
				const value = typeof defaultValue === "function" ? (defaultValue as () => O)() : defaultValue;
				ctx.data = value;
				return;
			}

			const result = schema.parse(input);
			if (!result.success) {
				// Forward errors
				result.issues.forEach(issue => addIssue(ctx, issue));
				return;
			}
			ctx.data = result.data;
		},
		schema._metadata,
	) as unknown as Schema<I | undefined, O>;
};

/**
 * Make schema optional (accepts undefined)
 *
 * @param schema - Base schema
 * @param options - Optional options
 * @returns Optional schema
 *
 * @example
 * ```ts
 * const optionalString = optional(string());
 * const optionalWithDefault = optional(string(), { default: 'default' });
 * ```
 */
export const optional = <I, O>(
	schema: Schema<I, O>,
	options?: { default?: O | (() => O) },
): Schema<I | undefined, O | undefined> => {
	return createSchema<I | undefined, O | undefined>(
		(input, ctx) => {
			if (input === undefined) {
				if (options?.default !== undefined) {
					const value = typeof options.default === "function" ? (options.default as () => O)() : options.default;
					ctx.data = value;
					return;
				}
				ctx.data = undefined;
				return;
			}

			const result = schema.parse(input);
			if (!result.success) {
				// Forward errors
				result.issues.forEach(issue => addIssue(ctx, issue));
				return;
			}
			ctx.data = result.data;
		},
		schema._metadata,
	) as unknown as Schema<I | undefined, O | undefined>;
};

/**
 * Make schema nullable (accepts null)
 *
 * @param schema - Base schema
 * @param options - Nullable options
 * @returns Nullable schema
 *
 * @example
 * ```ts
 * const nullableString = nullable(string());
 * const nullableWithDefault = nullable(string(), { default: 'default' });
 * ```
 */
export const nullable = <I, O>(
	schema: Schema<I, O>,
	options?: { default?: O | (() => O) },
): Schema<I | null, O | null> => {
	return createSchema<I | null, O | null>(
		(input, ctx) => {
			if (input === null) {
				if (options?.default !== undefined) {
					const value = typeof options.default === "function" ? (options.default as () => O)() : options.default;
					ctx.data = value;
					return;
				}
				ctx.data = null;
				return;
			}

			const result = schema.parse(input);
			if (!result.success) {
				// Forward errors
				result.issues.forEach(issue => addIssue(ctx, issue));
				return;
			}
			ctx.data = result.data;
		},
		schema._metadata,
	) as Schema<I | null, O | null>;
};
