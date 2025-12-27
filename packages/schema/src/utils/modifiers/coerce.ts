/**
 * Type Coercion Utilities
 *
 * Automatic type conversion for common scenarios.
 * Better than competitors by providing safe, predictable coercion with full type safety.
 *
 * Key advantages:
 * - Type-safe coercion
 * - Customizable coercion rules
 * - Clear error messages on coercion failure
 * - Composable with other validators
 * - Zero-cost abstractions
 *
 * @example
 * ```ts
 * // Coerce string to number
 * const age = coerce.number(number({ min: 0 }));
 * age.parse("25"); // Ok({ value: 25 })
 *
 * // Coerce to boolean
 * const isActive = coerce.boolean();
 * isActive.parse("true"); // Ok({ value: true })
 * isActive.parse("1");    // Ok({ value: true })
 * isActive.parse("yes");  // Ok({ value: true })
 * ```
 */

import { ERROR_MESSAGES } from "../../constant";
import { Result } from "../../lib";
import type { Schema } from "../../types";
import { createError } from "../../utils";

/**
 * Coerce string to number
 *
 * Converts string input to number before validation.
 * Handles common number formats including decimals, negatives, and scientific notation.
 *
 * @param schema - Number schema to apply after coercion
 * @param options - Coercion options
 * @returns Schema that accepts string or number input
 *
 * @example
 * ```ts
 * const price = coerce.number(number({ min: 0 }));
 *
 * price.parse("19.99");  // Ok({ value: 19.99 })
 * price.parse(19.99);    // Ok({ value: 19.99 })
 * price.parse("abc");    // Err - invalid number
 * price.parse("-5");     // Err - fails min: 0 constraint
 * ```
 */
export const coerceNumber = <Output>(
	schema: Schema<number, Output>,
	options: {
		readonly strict?: boolean; // If true, only allow valid number strings
		readonly radix?: number; // Radix for parseInt (2-36)
		readonly allowNaN?: boolean; // Allow NaN values
	} = {},
): Schema<string | number, Output> => {
	return {
		parse: (input: unknown) => {
			// Pass through if already number
			if (typeof input === "number") {
				// Check for NaN if not allowed
				if (Number.isNaN(input) && !options.allowNaN) {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}
				return schema.parse(input);
			}

			// Coerce string to number
			if (typeof input === "string") {
				const trimmed = input.trim();

				// Empty string is not a valid number
				if (trimmed === "") {
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}

				let num: number;

				// Use parseInt with radix if specified
				if (options.radix !== undefined) {
					num = parseInt(trimmed, options.radix);
				} // Use parseFloat for decimal numbers
				else if (options.strict) {
					// Strict mode: only allow valid number strings
					if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
						return Result.err([
							{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
						]);
					}
					num = Number(trimmed);
				} else {
					// Loose mode: use Number()
					num = Number(trimmed);
				}

				// Check for NaN
				if (Number.isNaN(num)) {
					if (options.allowNaN) {
						return schema.parse(num);
					}
					return Result.err([
						{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] },
					]);
				}

				return schema.parse(num);
			}

			// Cannot coerce other types
			return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_NUMBER), path: [] }]);
		},
		_metadata: schema._metadata,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		_output: schema._output,
	};
};

/**
 * Coerce string to boolean
 *
 * Converts string input to boolean using common conventions:
 * - true: "true", "yes", "1", "on"
 * - false: "false", "no", "0", "off"
 *
 * @param options - Coercion options
 * @returns Schema that accepts string or boolean input
 *
 * @example
 * ```ts
 * const isActive = coerce.boolean();
 *
 * isActive.parse("true");   // Ok({ value: true })
 * isActive.parse("1");      // Ok({ value: true })
 * isActive.parse("yes");    // Ok({ value: true })
 * isActive.parse("false");  // Ok({ value: false })
 * isActive.parse("0");      // Ok({ value: false })
 * isActive.parse(true);     // Ok({ value: true })
 * ```
 */
export const coerceBoolean = (
	options: {
		readonly trueValues?: readonly string[]; // Custom truthy values
		readonly falseValues?: readonly string[]; // Custom falsy values
		readonly caseSensitive?: boolean; // Case sensitive matching
	} = {},
): Schema<string | boolean | number, boolean> => {
	// Default truthy values
	const trueValues = options.trueValues || ["true", "yes", "1", "on"];
	// Default falsy values
	const falseValues = options.falseValues || ["false", "no", "0", "off", ""];

	return {
		parse: (input: unknown) => {
			// Pass through if already boolean
			if (typeof input === "boolean") {
				return Result.ok(input);
			}

			// Coerce number to boolean
			if (typeof input === "number") {
				return Result.ok(input !== 0);
			}

			// Coerce string to boolean
			if (typeof input === "string") {
				const processed = options.caseSensitive ? input.trim() : input.toLowerCase().trim();

				// Truthy values
				if (trueValues.includes(processed)) {
					return Result.ok(true);
				}

				// Falsy values
				if (falseValues.includes(processed)) {
					return Result.ok(false);
				}

				return Result.err([{ ...createError("Expected boolean-like value"), path: [] }]);
			}

			return Result.err([{ ...createError("Expected boolean"), path: [] }]);
		},
		_metadata: { name: "boolean" },
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_output: undefined as any as boolean,
	};
};

/**
 * Coerce string to Date
 *
 * Converts string or number (timestamp) to Date object.
 *
 * @param schema - Optional date schema to apply after coercion
 * @param options - Coercion options
 * @returns Schema that accepts string, number, or Date input
 *
 * @example
 * ```ts
 * const birthDate = coerce.date();
 *
 * birthDate.parse("2024-01-01");        // Ok({ value: Date })
 * birthDate.parse(1704067200000);       // Ok({ value: Date })
 * birthDate.parse(new Date());          // Ok({ value: Date })
 * birthDate.parse("invalid");           // Err - invalid date
 * ```
 */
export const coerceDate = <Output>(
	schema?: Schema<Date, Output>,
	options: {
		readonly formats?: readonly string[]; // Accepted date formats
		readonly strict?: boolean; // Strict parsing
	} = {},
): Schema<string | number | Date, Output extends Date ? Date : Output> => {
	return {
		parse: (input: unknown) => {
			let date: Date | null = null;

			// Pass through if already Date
			if (input instanceof Date) {
				date = input;
			} // Coerce number (timestamp) to Date
			else if (typeof input === "number") {
				date = new Date(input);
			} // Coerce string to Date
			else if (typeof input === "string") {
				// Try custom formats if provided
				if (options.formats && options.formats.length > 0) {
					let parsed = false;
					for (const format of options.formats) {
						// This is a simplified format parsing
						// In a real implementation, you'd use a proper date parsing library
						if (format === "iso" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(input)) {
							date = new Date(input);
							parsed = true;
							break;
						} else if (format === "date-only" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
							date = new Date(input);
							parsed = true;
							break;
						}
					}

					if (!parsed) {
						return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_DATE), path: [] }]);
					}
				} else {
					date = new Date(input);
				}
			} else {
				return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_DATE), path: [] }]);
			}

			// Check for invalid date
			if (!date || Number.isNaN(date.getTime())) {
				return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_DATE), path: [] }]);
			}

			// Apply schema if provided
			if (schema) {
				// biome-ignore lint/suspicious/noExplicitAny: Required for schema composition
				return schema.parse(date) as any;
			}

			// biome-ignore lint/suspicious/noExplicitAny: Required for return type
			return Result.ok(date) as any;
		},
		_metadata: { name: "date" },
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_output: undefined as any,
	};
};

/**
 * Coerce any input to string
 *
 * Converts primitive values to string using String().
 * Does not stringify objects or arrays.
 *
 * @param schema - Optional string schema to apply after coercion
 * @param options - Coercion options
 * @returns Schema that accepts any primitive input
 *
 * @example
 * ```ts
 * const id = coerce.string();
 *
 * id.parse("123");   // Ok({ value: "123" })
 * id.parse(123);     // Ok({ value: "123" })
 * id.parse(true);    // Ok({ value: "true" })
 * id.parse(null);    // Ok({ value: "null" })
 * ```
 */
export const coerceString = <Output>(
	schema?: Schema<string, Output>,
	options: {
		readonly allowObjects?: boolean; // Allow stringifying objects
		readonly allowArrays?: boolean; // Allow stringifying arrays
		readonly replacer?: (key: string, value: any) => any; // JSON.stringify replacer
		readonly space?: string | number; // JSON.stringify space
	} = {},
): Schema<any, Output extends string ? string : Output> => {
	return {
		parse: (input: unknown) => {
			let str: string;

			// Pass through if already string
			if (typeof input === "string") {
				str = input;
			} // Coerce primitives to string
			else if (
				typeof input === "number"
				|| typeof input === "boolean"
				|| input === null
				|| input === undefined
			) {
				str = String(input);
			} // Coerce arrays to JSON if allowed
			else if (Array.isArray(input) && options.allowArrays) {
				try {
					str = JSON.stringify(input, options.replacer, options.space);
				} catch {
					return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_STRING), path: [] }]);
				}
			} // Coerce objects to JSON if allowed
			else if (typeof input === "object" && input !== null && options.allowObjects) {
				try {
					str = JSON.stringify(input, options.replacer, options.space);
				} catch {
					return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_STRING), path: [] }]);
				}
			} // Don't stringify objects/arrays
			else {
				return Result.err([{ ...createError(ERROR_MESSAGES.EXPECTED_STRING), path: [] }]);
			}

			// Apply schema if provided
			if (schema) {
				// biome-ignore lint/suspicious/noExplicitAny: Required for schema composition
				return schema.parse(str) as any;
			}

			// biome-ignore lint/suspicious/noExplicitAny: Required for return type
			return Result.ok(str) as any;
		},
		_metadata: { name: "string" },
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_output: undefined as any,
	};
};

/**
 * Coerce array
 *
 * Wraps non-array values in an array.
 * Useful for handling single values or arrays uniformly.
 *
 * @param schema - Schema to apply to array items
 * @param options - Coercion options
 * @returns Schema that accepts single value or array
 *
 * @example
 * ```ts
 * const tags = coerce.array(string());
 *
 * tags.parse(["a", "b"]);  // Ok({ value: ["a", "b"] })
 * tags.parse("single");    // Ok({ value: ["single"] })
 * ```
 */
export const coerceArray = <Input, Output>(
	schema: Schema<Input[], Output>,
	options: {
		readonly splitBy?: string; // Split string by delimiter
		readonly trimItems?: boolean; // Trim array items
		readonly filterEmpty?: boolean; // Remove empty items
	} = {},
): Schema<Input | Input[] | string, Output> => {
	return {
		parse: (input: unknown) => {
			let arr: unknown[];

			// Split string by delimiter if provided
			if (typeof input === "string" && options.splitBy) {
				arr = input.split(options.splitBy);

				// Trim items if requested
				if (options.trimItems) {
					arr = arr.map(item => typeof item === "string" ? item.trim() : item);
				}

				// Filter empty items if requested
				if (options.filterEmpty) {
					arr = arr.filter(item => !(typeof item === "string" && item === ""));
				}
			} // Wrap non-array in array
			else {
				arr = Array.isArray(input) ? input : [input];
			}

			return schema.parse(arr as Input[]);
		},
		_metadata: schema._metadata,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		_output: schema._output,
	};
};

/**
 * Coerce utilities namespace
 * Provides convenient access to all coercion functions
 */
export const coerce = {
	number: coerceNumber,
	boolean: coerceBoolean,
	date: coerceDate,
	string: coerceString,
	array: coerceArray,
} as const;
