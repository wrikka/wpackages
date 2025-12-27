/**
 * Result utility for functional error handling
 */

export type Ok<T> = {
	readonly ok: true;
	readonly value: T;
	readonly isOk: () => boolean;
	readonly isErr: () => boolean;
	readonly unwrap: () => T;
	readonly unwrapOr: (defaultValue: T) => T;
	readonly unwrapErr: () => never;
	readonly map: <U>(fn: (value: T) => U) => Result<U, any>;
	readonly mapErr: <F>(fn: (error: any) => F) => Result<T, F>;
	readonly flatMap: <U>(fn: (value: T) => Result<U, any>) => Result<U, any>;
	readonly tap: (fn: (value: T) => void) => Result<T, any>;
	readonly tapErr: (fn: (error: any) => void) => Result<T, any>;
	readonly match: <U>(handlers: { ok: (value: T) => U; err: (error: any) => U }) => U;
};

export type Err<E> = {
	readonly ok: false;
	readonly error: E;
	readonly isOk: () => boolean;
	readonly isErr: () => boolean;
	readonly unwrap: () => never;
	readonly unwrapOr: <T>(defaultValue: T) => T;
	readonly unwrapErr: () => E;
	readonly map: <U>(fn: (value: any) => U) => Result<U, E>;
	readonly mapErr: <F>(fn: (error: E) => F) => Result<any, F>;
	readonly flatMap: <U>(fn: (value: any) => Result<U, E>) => Result<U, E>;
	readonly tap: (fn: (value: any) => void) => Result<any, E>;
	readonly tapErr: (fn: (error: E) => void) => Result<any, E>;
	readonly match: <U>(handlers: { ok: (value: any) => U; err: (error: E) => U }) => U;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T, E = never>(value: T): Result<T, E> => ({
	ok: true,
	value,
	isOk: () => true,
	isErr: () => false,
	unwrap: () => value,
	unwrapOr: () => value,
	unwrapErr: () => {
		throw new Error("Attempted to unwrapErr an Ok value");
	},
	map: <U>(fn: (v: T) => U) => ok<U, E>(fn(value)),
	mapErr: () => ok<T, E>(value) as any,
	flatMap: <U>(fn: (v: T) => Result<U, E>) => fn(value),
	tap: (fn: (v: T) => void) => {
		fn(value);
		return ok<T, E>(value) as any;
	},
	tapErr: () => ok<T, E>(value) as any,
	match: <U>(handlers: { ok: (v: T) => U; err: (e: E) => U }) => handlers.ok(value),
}) as Ok<T>;

export const err = <E>(error: E): Result<any, E> => ({
	ok: false,
	error,
	isOk: () => false,
	isErr: () => true,
	unwrap: () => {
		throw new Error("Attempted to unwrap an Err value");
	},
	unwrapOr: <U>(defaultValue: U) => defaultValue,
	unwrapErr: () => error,
	map: () => err(error) as any,
	mapErr: <F>(fn: (e: E) => F) => err(fn(error)),
	flatMap: () => err(error) as any,
	tap: () => err(error) as any,
	tapErr: (fn: (e: E) => void) => {
		fn(error);
		return err(error) as any;
	},
	match: <U>(handlers: { ok: (v: any) => U; err: (e: E) => U }) => handlers.err(error),
}) as Err<E>;

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok === true;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result.ok === false;

export const unwrap = <T, E>(result: Result<T, E>): T => {
	if (isOk(result)) return result.value;
	throw new Error("Attempted to unwrap an Err value");
};

export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T =>
	isOk(result) ? result.value : defaultValue;

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
