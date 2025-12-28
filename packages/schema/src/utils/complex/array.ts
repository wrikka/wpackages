/**
 * Array Schema
 *
 * Type-safe array validation with element schemas
 */

import type { Infer, Schema, SchemaOptions } from "../../types";
import { addIssue, createSchema } from "../../utils";

/**
 * Array schema options
 */
export interface ArrayOptions extends SchemaOptions {
	readonly min?: number;
	readonly max?: number;
	readonly length?: number;
	readonly nonempty?: boolean;
	readonly unique?: boolean;
	readonly sorted?: boolean;
	readonly distinctBy?: (a: unknown, b: unknown) => boolean;
}

/**
 * Create an array schema
 *
 * @param elementSchema - Schema for array elements
 * @param options - Array validation options
 * @returns Array schema
 *
 * @example
 * ```ts
 * const numbers = array(number());
 * const names = array(string({ min: 1 }), { nonempty: true });
 * ```
 */
export const array = <S extends Schema<unknown, unknown>>(
	elementSchema: S,
	options: ArrayOptions = {},
): Schema<Infer<S>[], Infer<S>[]> => {
	return createSchema<Infer<S>[], Infer<S>[]>(
		(input, ctx): undefined => {
			// Type check
			if (!Array.isArray(input)) {
				addIssue(ctx, {
					code: "invalid_type",
					expected: "array",
					received: input,
					message: options.message || "Expected array",
				});
				return;
			}

			// Length validation
			if (options.length !== undefined && input.length !== options.length) {
				addIssue(ctx, {
					code: "invalid_string",
					expected: `exactly ${options.length} elements`,
					received: input,
					message: `Array must have exactly ${options.length} elements`,
				});
			}

			if (options.min !== undefined && input.length < options.min) {
				addIssue(ctx, {
					code: "too_small",
					minimum: options.min,
					received: input,
					message: `Array must have at least ${options.min} elements`,
				});
			}

			if (options.max !== undefined && input.length > options.max) {
				addIssue(ctx, {
					code: "too_big",
					maximum: options.max,
					received: input,
					message: `Array must have at most ${options.max} elements`,
				});
			}

			if (options.nonempty && input.length === 0) {
				addIssue(ctx, {
					code: "too_small",
					minimum: 1,
					received: input,
					message: "Array must not be empty",
				});
			}

			// Validate each element
			const validatedElements: Infer<S>[] = [];
			for (let i = 0; i < input.length; i++) {
				const result = elementSchema.parse(input[i]);
				if (!result.success) {
					// Add index to error paths
					for (const issue of result.issues) {
						ctx.issues.push({
							...issue,
							path: [i, ...issue.path],
						});
					}
				} else {
					validatedElements.push(result.data as Infer<S>);
				}
			}

			// Additional validations
			if (options.unique || options.distinctBy) {
				const distinctFn = options.distinctBy || ((a: unknown, b: unknown) => a === b);

				for (let i = 0; i < validatedElements.length; i++) {
					const current = validatedElements[i];
					let isDuplicate = false;

					for (let j = 0; j < i; j++) {
						const previous = validatedElements[j];
						if (distinctFn(current, previous)) {
							isDuplicate = true;
							break;
						}
					}

					if (isDuplicate) {
						ctx.issues.push({
							code: "duplicate_values",
							path: [i],
							received: current,
							message: "Array contains duplicate values",
						});
					}
				}
			}

			if (options.sorted) {
				for (let i = 1; i < validatedElements.length; i++) {
					const temp = validatedElements[i];
					const prev = validatedElements[i - 1];
					if (temp != null && prev != null && temp < prev) {
						ctx.issues.push({
							code: "invalid_string",
							path: [i],
							received: temp,
							message: "Array must be sorted in ascending order",
						});
						break;
					}
				}
			}

			ctx.data = validatedElements;
		},
		{
			name: options.name || "Array",
		},
	);
};

/**
 * Non-empty array schema (shorthand)
 */
export const nonempty = <S extends Schema<unknown, unknown>>(
	elementSchema: S,
	options: Omit<ArrayOptions, "nonempty"> = {},
) => array(elementSchema, { ...options, nonempty: true });
