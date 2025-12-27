/**
 * Result type for error handling
 * Represents either a success (Ok) or failure (Err)
 */

export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
	readonly _tag: "Ok";
	readonly value: T;
}

export interface Err<E> {
	readonly _tag: "Err";
	readonly error: E;
}

/**
 * Create a success result
 */
export const ok = <T>(value: T): Ok<T> => ({
	_tag: "Ok",
	value,
});

/**
 * Create an error result
 */
export const err = <E>(error: E): Err<E> => ({
	_tag: "Err",
	error,
});

/**
 * Check if result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
	result._tag === "Ok";

/**
 * Check if result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
	result._tag === "Err";

/**
 * Map over success value
 */
export const map = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => U,
): Result<U, E> => (isOk(result) ? ok(fn(result.value)) : result);

/**
 * Map over error value
 */
export const mapErr = <T, E, F>(
	result: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> => (isErr(result) ? err(fn(result.error)) : result);

/**
 * Flat map (chain) over success value
 */
export const flatMap = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => (isOk(result) ? fn(result.value) : result);

/**
 * Get value or default
 */
export const getOrElse = <T, E>(
	result: Result<T, E>,
	defaultValue: T,
): T => (isOk(result) ? result.value : defaultValue);

/**
 * Get error or default
 */
export const getErrorOrElse = <T, E>(
	result: Result<T, E>,
	defaultError: E,
): E => (isErr(result) ? result.error : defaultError);
