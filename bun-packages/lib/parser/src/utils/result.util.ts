/**
 * Result utility for functional error handling
 * Pure functional approach to error handling without exceptions
 */

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok === true;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.ok === false;

export const unwrap = <T, E>(result: Result<T, E>): T => {
	if (isOk(result)) return result.value;
	throw new Error("Attempted to unwrap an Err value");
};

export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => isOk(result) ? result.value : defaultValue;

export const unwrapErr = <T, E>(result: Result<T, E>): E => {
	if (isErr(result)) return result.error;
	throw new Error("Attempted to unwrapErr an Ok value");
};

export const map = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => U,
): Result<U, E> => (isOk(result) ? ok(fn(result.value)) : result);

export const mapErr = <T, E, F>(
	result: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> => (isErr(result) ? err(fn(result.error)) : result);

export const flatMap = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => (isOk(result) ? fn(result.value) : result);
