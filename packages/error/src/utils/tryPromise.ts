import { Effect } from "effect";
import { AppError } from "../types";

/**
 * Creates an `Effect` from a function that can be synchronous or asynchronous (return a `Promise`).
 * It safely wraps the execution in a `try...catch` block, automatically converting any thrown exceptions into an `AppError`.
 *
 * @param fn The function to execute. It can return a value or a `Promise`.
 * @param statusCode The HTTP status code to assign to the `AppError` if the function throws an exception. Defaults to 500.
 * @returns An `Effect` that will either succeed with the function's return value or fail with an `AppError`.
 *
 * @example
 * // Wrapping a promise that resolves
 * const successfulEffect = tryPromise(() => Promise.resolve('Success!'));
 *
 * // Wrapping a function that throws an error
 * const failedEffect = tryPromise(() => { throw new Error('Failure!'); }, 400);
 */
export const tryPromise = <T>(
	fn: () => Promise<T> | T,
	statusCode: number = 500,
) =>
	Effect.tryPromise({
		try: (_signal) => Promise.resolve(fn()),
		catch: (unknown) => {
			const message = unknown instanceof Error ? unknown.message : String(unknown);
			return new AppError({
				message,
				statusCode,
				isOperational: true,
			});
		},
	});
