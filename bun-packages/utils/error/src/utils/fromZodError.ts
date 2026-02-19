import { ZodError } from "zod";
import { ValidationError } from "../types";

/**
 * Creates a `ValidationError` from a `ZodError`.
 * It formats the error messages from Zod into a single, readable string.
 *
 * @param zodError The error object thrown by Zod during parsing.
 * @param options Optional configuration for status code and operational flag.
 * @returns A `ValidationError` instance.
 *
 * @example
 * import { z } from 'zod';
 * import { fromZodError } from './fromZodError';
 *
 * const schema = z.object({ name: z.string() });
 * const result = schema.safeParse({ name: 123 });
 *
 * if (!result.success) {
 *   const validationError = fromZodError(result.error);
 *   // validationError is a ValidationError with a formatted message.
 * }
 */
export const fromZodError = (
	zodError: ZodError,
	options: { statusCode?: number; isOperational?: boolean } = {},
) => {
	const message = zodError.errors
		.map((e) => `${e.path.join(".")} - ${e.message}`)
		.join(", ");

	return new ValidationError({
		message: `Validation failed: ${message}`,
		statusCode: options.statusCode ?? 400,
		isOperational: options.isOperational ?? true,
		cause: zodError,
	});
};
