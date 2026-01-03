/**
 * Result utility for functional error handling
 */

export type Ok<T, E> = {
	readonly ok: true;
	readonly value: T;
	readonly isOk: () => boolean;
	readonly isErr: () => boolean;
	readonly unwrap: () => T;
	readonly unwrapOr: (defaultValue: T) => T;
	readonly unwrapErr: () => never;
	readonly map: <U>(fn: (value: T) => U) => Result<U, E>;
	readonly mapErr: <F>(_fn: (error: E) => F) => Result<T, F>;
	readonly flatMap: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;
	readonly tap: (fn: (value: T) => void) => Result<T, E>;
	readonly tapErr: (_fn: (error: E) => void) => Result<T, E>;
	readonly match: <U>(handlers: {
		ok: (value: T) => U;
		err: (error: E) => U;
	}) => U;
};

export type Err<T, E> = {
	readonly ok: false;
	readonly error: E;
	readonly isOk: () => boolean;
	readonly isErr: () => boolean;
	readonly unwrap: () => never;
	readonly unwrapOr: (defaultValue: T) => T;
	readonly unwrapErr: () => E;
	readonly map: <U>(_fn: (value: never) => U) => Result<U, E>;
	readonly mapErr: <F>(fn: (error: E) => F) => Result<T, F>;
	readonly flatMap: <U>(_fn: (value: never) => Result<U, E>) => Result<U, E>;
	readonly tap: (_fn: (value: never) => void) => Result<T, E>;
	readonly tapErr: (fn: (error: E) => void) => Result<T, E>;
	readonly match: <U>(handlers: {
		ok: (value: never) => U;
		err: (error: E) => U;
	}) => U;
};

export type Result<T, E> = Ok<T, E> | Err<T, E>;

export const ok = <T, E = never>(value: T): Result<T, E> => {
	const self: Ok<T, E> = {
		ok: true,
		value,
		isOk: () => true,
		isErr: () => false,
		unwrap: () => value,
		unwrapOr: (_defaultValue: T) => value,
		unwrapErr: () => {
			throw new Error("Attempted to unwrapErr an Ok value");
		},
		map: <U>(fn: (v: T) => U) => ok<U, E>(fn(value)),
		mapErr: <F>(_fn: (e: E) => F) => ok<T, F>(value),
		flatMap: <U>(fn: (v: T) => Result<U, E>) => fn(value),
		tap: (fn: (v: T) => void) => {
			fn(value);
			return self;
		},
		tapErr: () => self,
		match: <U>(handlers: { ok: (v: T) => U; err: (e: E) => U }) => handlers.ok(value),
	};
	return self;
};

export const err = <T = never, E = unknown>(error: E): Err<T, E> => {
	const self: Err<T, E> = {
		ok: false,
		error,
		isOk: () => false,
		isErr: () => true,
		unwrap: () => {
			throw new Error("Attempted to unwrap an Err value");
		},
		unwrapOr: (defaultValue: T) => defaultValue,
		unwrapErr: () => error,
		map: <U>() => self as unknown as Result<U, E>,
		mapErr: <F>(fn: (e: E) => F) => err<T, F>(fn(error)),
		flatMap: <U>() => self as unknown as Result<U, E>,
		tap: () => self,
		tapErr: (fn: (e: E) => void) => {
			fn(error);
			return self;
		},
		match: <U>(handlers: { ok: (v: never) => U; err: (e: E) => U }) => handlers.err(error),
	};
	return self;
};

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T, E> => result.ok === true;

export const isErr = <T, E>(result: Result<T, E>): result is Err<T, E> => result.ok === false;

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
): Result<U, E> =>
	isOk(result)
		? ok<U, E>(fn(result.value))
		: (result as unknown as Result<U, E>);

export const mapErr = <T, E, F>(
	result: Result<T, E>,
	fn: (error: E) => F,
): Result<T, F> =>
	isErr(result)
		? (err(fn(result.error)) as unknown as Result<T, F>)
		: (result as unknown as Result<T, F>);

export const flatMap = <T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> => isOk(result) ? fn(result.value) : (result as unknown as Result<U, E>);
