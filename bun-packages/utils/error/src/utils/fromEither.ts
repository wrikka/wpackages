import { Effect, Either } from "effect";
import { AppError } from "../types";

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
 * const effectFromRight = fromEither()(right); // Succeeds with 'Success'
 *
 * const left = Either.left('Failure');
 * const effectFromLeft = fromEither({ statusCode: 404 })(left); // Fails with AppError({ message: 'Failure', statusCode: 404 })
 */
export const fromEither = <E>(
	options: { readonly statusCode?: number } = {},
) =>
<A>(either: Either.Either<A, E>): Effect.Effect<A, AppError> =>
	Either.match(either, {
		onLeft: (e) => {
			const message = e instanceof Error ? e.message : String(e);
			return Effect.fail(
				new AppError({
					message,
					statusCode: options.statusCode ?? 500,
					isOperational: true,
				}),
			);
		},
		onRight: (a) => Effect.succeed(a),
	});
