/**
 * Result type for functional error handling
 */
export type Result<T, E = Error> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Create a successful result
 */
export const ok = <T, E = Error>(value: T): Result<T, E> => ({
	success: true,
	value,
});

/**
 * Create a failed result
 */
export const err = <T, E = Error>(error: E): Result<T, E> => ({
	success: false,
	error,
});

/**
 * Check if result is successful
 */
export const isOk = <T, E>(
	result: Result<T, E>,
): result is { success: true; value: T } => result.success === true;

/**
 * Check if result is failed
 */
export const isErr = <T, E>(
	result: Result<T, E>,
): result is { success: false; error: E } => result.success === false;

/**
 * Map successful result
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
 * Map error result
 */
export const mapErr = <T, E, F>(
	result: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> => {
	if (isErr(result)) {
		return err(fn(result.error));
	}
	return result;
};

/**
 * Chain result operations
 */
export const chain = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => {
	if (isOk(result)) {
		return fn(result.value);
	}
	return result;
};

/**
 * Unwrap result or throw error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
	if (isOk(result)) {
		return result.value;
	}
	throw result.error;
};

/**
 * Unwrap result or return default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
	if (isOk(result)) {
		return result.value;
	}
	return defaultValue;
};
