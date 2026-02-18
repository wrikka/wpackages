import { Schema } from "../lib/base";
import type { SchemaIssue } from "../types";

/**
 * Create a schema from a custom validation function
 */
export function custom<T>(
	validator: (value: unknown) => value is T,
	message = "Invalid value",
): Schema<T> {
	const schema = new (class extends Schema<T> {
		protected _validate(value: unknown, ctx: { addIssue: (issue: SchemaIssue) => void }): unknown {
			if (!validator(value)) {
				ctx.addIssue({
					code: "custom",
					message,
					value,
				});
			}
			return value;
		}

		protected _clone(): Schema<T> {
			return custom(validator, message);
		}

		toJSON(): Record<string, unknown> {
			return { type: "unknown" };
		}
	})();

	return schema;
}

/**
 * Check if a value is valid according to a schema
 */
export function is<T>(schema: Schema<T>, value: unknown): value is T {
	return schema.safeParse(value).success;
}

/**
 * Assert that a value matches a schema (throws if not)
 */
export function assert<T>(schema: Schema<T>, value: unknown): asserts value is T {
	schema.parse(value);
}

/**
 * Parse with a default value if parsing fails
 */
export function parseWithFallback<T>(schema: Schema<T>, value: unknown, fallback: T): T {
	const result = schema.safeParse(value);
	return result.success ? result.data : fallback;
}

/**
 * Deep partial - make all nested properties optional
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required - make all nested properties required
 */
export type DeepRequired<T> = {
	[P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract inferred type from schema
 */
export type Infer<T extends Schema<unknown>> = T extends Schema<infer U> ? U : never;

/**
 * Extract input type from schema (before transformation)
 */
export type InferIn<T extends Schema<unknown>> = T extends Schema<infer U> ? unknown : never;
