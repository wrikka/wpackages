import { Data } from "effect";

/**
 * Represents an application-specific error.
 * Extends `Data.TaggedError` from the `effect` library to allow for robust, type-safe pattern matching on error types.
 *
 * @example
 * // Creating an AppError
 * const error = new AppError({ message: 'User not found', statusCode: 404 });
 *
 * // Using it in an Effect
 * import { Effect } from 'effect';
 * const program = Effect.fail(error);
 */
export class AppError extends Data.TaggedError("AppError")<{
	message: string;
	statusCode: number;
	isOperational?: boolean;
	cause?: unknown;
}> {}
