/**
 * String Schema
 *
 * Type-safe string validation with refinements
 */

// Mocked utils for now
const isString = (val: unknown): val is string => typeof val === "string";
const isEmail = (val: string): boolean => /^\S+@\S+\.\S+$/.test(val);
const isUrl = (val: string): boolean =>
	/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(val);
const isUuid = (val: string): boolean =>
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const ERROR_MESSAGES = {
	EXPECTED_STRING: "Expected a string",
	STRING_TOO_SHORT: (min: number) =>
		`String must be at least ${min} characters long`,
	STRING_TOO_LONG: (max: number) =>
		`String must be at most ${max} characters long`,
	STRING_PATTERN_MISMATCH: (pattern: RegExp) =>
		`String does not match pattern: ${pattern}`,
	INVALID_EMAIL: "Invalid email format",
	INVALID_URL: "Invalid URL format",
	INVALID_UUID: "Invalid UUID format",
};

import { createSchema } from "../../core/create";
import type { Schema, SchemaOptions } from "../../types";
import { addIssue } from "../../errors";

/**
 * String refinement options
 */
export interface StringOptions extends SchemaOptions {
	readonly min?: number;
	readonly max?: number;
	readonly length?: number;
	readonly pattern?: RegExp;
	readonly email?: boolean;
	readonly url?: boolean;
	readonly uuid?: boolean;
	readonly cuid?: boolean;
	readonly cuid2?: boolean;
	readonly ulid?: boolean;
	readonly datetime?: boolean;
	readonly ip?: boolean;
	readonly ipv4?: boolean;
	readonly ipv6?: boolean;
	readonly emoji?: boolean;
	readonly includes?: string;
	readonly startsWith?: string;
	readonly endsWith?: string;
	readonly trim?: boolean;
	readonly toLowerCase?: boolean;
	readonly toUpperCase?: boolean;
	readonly allowEmpty?: boolean;
}

/**
 * Create a string schema
 *
 * @param options - String validation options
 * @returns String schema
 *
 * @example
 * ```ts
 * const name = string({ min: 2, max: 50 });
 * const email = string({ email: true });
 * const url = string({ url: true });
 * ```
 */
export const string = (options: StringOptions = {}): Schema<string, string> => {
	return createSchema<string, string>(
		(input, ctx) => {
			if (!isString(input)) {
				addIssue(ctx, {
					code: "invalid_type",
					expected: "string",
					message: options.message || ERROR_MESSAGES.EXPECTED_STRING,
				});
				return;
			}

			let value = input;
			if (options.trim) value = value.trim();
			if (options.toLowerCase) value = value.toLowerCase();
			if (options.toUpperCase) value = value.toUpperCase();

			// Check for empty strings
			if (options.allowEmpty === false && value.length === 0) {
				addIssue(ctx, {
					code: "too_small",
					minimum: 1,
					message: ERROR_MESSAGES.STRING_TOO_SHORT(1),
				});
			}

			// Length validation
			if (options.length !== undefined && value.length !== options.length) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "length",
					expected: `exactly ${options.length} characters`,
					message: `String must be exactly ${options.length} characters`,
				});
			}

			if (options.min !== undefined && value.length < options.min) {
				addIssue(ctx, {
					code: "too_small",
					minimum: options.min,
					message: ERROR_MESSAGES.STRING_TOO_SHORT(options.min),
				});
			}
			if (options.max !== undefined && value.length > options.max) {
				addIssue(ctx, {
					code: "too_big",
					maximum: options.max,
					message: ERROR_MESSAGES.STRING_TOO_LONG(options.max),
				});
			}

			// Pattern validation
			if (options.pattern && !options.pattern.test(value)) {
				addIssue(ctx, {
					code: "pattern_mismatch",
					pattern: options.pattern,
					message: ERROR_MESSAGES.STRING_PATTERN_MISMATCH(options.pattern),
				});
			}

			// String format validations
			if (options.email && !isEmail(value)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "email",
					message: ERROR_MESSAGES.INVALID_EMAIL,
				});
			}
			if (options.url && !isUrl(value)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "url",
					message: ERROR_MESSAGES.INVALID_URL,
				});
			}
			if (options.uuid && !isUuid(value)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "uuid",
					message: ERROR_MESSAGES.INVALID_UUID,
				});
			}
			if (options.includes && !value.includes(options.includes)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "includes",
					expected: `to include "${options.includes}"`,
					message: `String must include "${options.includes}"`,
				});
			}
			if (options.startsWith && !value.startsWith(options.startsWith)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "startsWith",
					expected: `to start with "${options.startsWith}"`,
					message: `String must start with "${options.startsWith}"`,
				});
			}
			if (options.endsWith && !value.endsWith(options.endsWith)) {
				addIssue(ctx, {
					code: "invalid_string",
					validation: "endsWith",
					expected: `to end with "${options.endsWith}"`,
					message: `String must end with "${options.endsWith}"`,
				});
			}

			ctx.data = value;
		},
		{
			...options,
			name: options.name || "String",
		},
	);
};

/**
 * Email schema (shorthand)
 */
export const email = (options: SchemaOptions = {}) =>
	string({ ...options, email: true });

/**
 * URL schema (shorthand)
 */
export const url = (options: SchemaOptions = {}) =>
	string({ ...options, url: true });

/**
 * UUID schema (shorthand)
 */
export const uuid = (options: SchemaOptions = {}) =>
	string({ ...options, uuid: true });
