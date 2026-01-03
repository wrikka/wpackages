import { Effect, Data, Either } from 'effect';

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
export class AppError extends Data.TaggedError('AppError')<{
  message: string;
  statusCode: number;
  isOperational?: boolean;
}> {}

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
    catch: (unknown) =>
      new AppError({
        message: String(unknown),
        statusCode,
        isOperational: true,
      }),
  });

/**
 * Maps the error channel of an `Effect` to a new `AppError`.
 *
 * @param self The `Effect` to act on.
 * @param f A function that takes the original error and returns a new `AppError`.
 * @returns A new `Effect` with the error channel mapped.
 *
 * @example
 * const originalEffect = Effect.fail(new Error('Original error'));
 * const mappedEffect = mapError(originalEffect, (e) => new AppError({ message: `Mapped: ${e.message}`, statusCode: 500 }));
 */
export const mapError = <A, E>(
  self: Effect.Effect<A, E>,
  f: (e: E) => AppError,
): Effect.Effect<A, AppError> => Effect.mapError(self, f);

/**
 * Converts an `Either` to an `Effect`, mapping the `Left` side to an `AppError`.
 *
 * @param either The `Either` to convert.
 * @param statusCode The status code for the `AppError` if the `Either` is `Left`. Defaults to 500.
 * @returns An `Effect` that succeeds with the `Right` value or fails with an `AppError`.
 *
 * @example
 * import { Either } from 'effect';
 *
 * const right = Either.right('Success');
 * const effectFromRight = fromEither(right); // Succeeds with 'Success'
 *
 * const left = Either.left('Failure');
 * const effectFromLeft = fromEither(left, 404); // Fails with AppError({ message: 'Failure', statusCode: 404 })
 */
export const fromEither = <A, E>(
  either: Either.Either<A, E>,
  statusCode: number = 500,
): Effect.Effect<A, AppError> =>
  Either.match(either, {
    onLeft: (e) =>
      Effect.fail(
        new AppError({
          message: String(e),
          statusCode,
          isOperational: true,
        }),
      ),
    onRight: (a) => Effect.succeed(a),
  });