/**
 * Result type - Functional error handling
 * Alternative to throwing exceptions
 */

export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
	readonly success: true;
	readonly ok: true;
	readonly value: T;
};

export type Err<E> = {
	readonly success: false;
	readonly ok: false;
	readonly error: E;
};

/**
 * Create a successful result
 */
export const ok = <T>(value: T): Ok<T> => ({
	success: true,
	ok: true,
	value,
});

/**
 * Create an error result
 */
export const err = <E>(error: E): Err<E> => ({
	success: false,
	ok: false,
	error,
});

/**
 * Check if result is Ok
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => {
	return result.success === true;
};

/**
 * Check if result is Err
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => {
	return result.success === false;
};

/**
 * Map over a successful result
 */
export const map = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => U,
): Result<U, E> => {
	if (isOk(result)) {
		return ok(fn(result.value));
	}
	return result;
};

/**
 * Map over an error result
 */
export const mapError = <T, E, F>(
	result: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> => {
	if (isErr(result)) {
		return err(fn(result.error));
	}
	return result as unknown as Result<T, F>;
};

/**
 * Chain results together
 */
export const flatMap = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => {
	if (isOk(result)) {
		return fn(result.value);
	}
	return result;
};

/**
 * Get value or default
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T => {
	if (isOk(result)) {
		return result.value;
	}
	return defaultValue;
};

/**
 * Get value or throw error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
	if (isOk(result)) {
		return result.value;
	}
	const error = result.error instanceof Error ? result.error : new Error(String(result.error));
	throw error;
};

/**
 * Combine multiple results into one
 */
export const combine = <T, E>(
	results: readonly Result<T, E>[],
): Result<readonly T[], E> => {
	const values: T[] = [];

	for (const result of results) {
		if (isErr(result)) {
			return result;
		}
		values.push(result.value);
	}

	return ok(values);
};

/**
 * Result namespace for convenient access
 */
export const Result = {
	ok,
	err,
	isOk,
	isErr,
	map,
	mapError,
	flatMap,
	getOrElse,
	unwrap,
	combine,
};
