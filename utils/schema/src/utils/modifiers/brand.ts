/**
 * Branding Utilities
 *
 * Create branded types for better type safety.
 * Better than competitors with more flexible branding options.
 */

import { createSchema } from "../../lib";
import type { Result, Schema } from "../../types";

/**
 * Create a branded type
 *
 * @param schema - Base schema to brand
 * * @param brand - Brand identifier
 * @returns Branded schema
 *
 * @example
 * ```ts
 * const EmailSchema = brand(string(), 'Email');
 * type Email = Infer<typeof EmailSchema>; // string & { __brand: 'Email' }
 * ```
 */
export const brand = <TInput, TOutput, Brand extends string>(
	schema: Schema<TInput, TOutput>,
	brand: Brand,
): Schema<TInput, TOutput & { __brand: Brand }> => {
	return createSchema({
		_metadata: { name: brand },
		_input: schema._input,
		_output: undefined as unknown as TOutput & { __brand: Brand },
		parse(input: unknown): Result<TOutput & { __brand: Brand }> {
			const result = schema.parse(input);
			if (!result.success) {
				return result;
			}
			return {
				success: true,
				data: result.data as TOutput & { __brand: Brand },
			};
		},
	});
};

/**
 * Unbrand a branded type
 *
 * @param value - Branded value
 * @returns Unbranded value
 *
 * @example
 * ```ts
 * const email: Email = "user@example.com" as Email;
 * const unbranded: string = unbrand(email);
 * ```
 */
export const unbrand = <T>(
	value: T,
): T extends { __brand: string } ? Omit<T, "__brand"> : T => {
	if (typeof value === "object" && value !== null && "__brand" in value) {
		const { __brand: _, ...rest } = value as { __brand: string };
		return rest as T extends { __brand: string } ? Omit<T, "__brand"> : T;
	}
	return value as T extends { __brand: string } ? Omit<T, "__brand"> : T;
};

/**
 * Check if a value has a specific brand
 *
 * @param value - Value to check
 * * @param brand - Brand to check for
 * @returns Whether the value has the brand
 *
 * @example
 * ```ts
 * const email: Email = "user@example.com" as Email;
 * const isEmail = hasBrand(email, 'Email'); // true
 * ```
 */
export const hasBrand = <T, Brand extends string>(
	value: T,
	brand: Brand,
): value is T & { __brand: Brand } => {
	return (
		typeof value === "object"
		&& value !== null
		&& "__brand" in value
		&& (value as { __brand: string }).__brand === brand
	);
};

// Predefined branded types for common use cases
export type UUID = string & { __brand: "UUID" };
export type Email = string & { __brand: "Email" };
export type URL = string & { __brand: "URL" };
export type PositiveNumber = number & { __brand: "PositiveNumber" };
export type Integer = number & { __brand: "Integer" };
export type NonEmptyString = string & { __brand: "NonEmptyString" };
export type Timestamp = number & { __brand: "Timestamp" };

// Shorthand branded schemas
export const uuidBrand = (schema: Schema<string>) => brand(schema, "UUID");
export const emailBrand = (schema: Schema<string>) => brand(schema, "Email");
export const urlBrand = (schema: Schema<string>) => brand(schema, "URL");
export const positiveNumberBrand = (schema: Schema<number>) => brand(schema, "PositiveNumber");
export const integerBrand = (schema: Schema<number>) => brand(schema, "Integer");
export const nonEmptyStringBrand = (schema: Schema<string>) => brand(schema, "NonEmptyString");
export const timestampBrand = (schema: Schema<number>) => brand(schema, "Timestamp");
