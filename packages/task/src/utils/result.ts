import type { Result } from "../types";

/**
 * Create a success result
 */
export const ok = <E, A>(value: A): Result<E, A> => ({
	_tag: "Success",
	value,
});

/**
 * Create a failure result
 */
export const err = <E, A>(error: E): Result<E, A> => ({
	_tag: "Failure",
	error,
});
