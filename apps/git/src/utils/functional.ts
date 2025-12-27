/**
 * Functional Programming Utilities for Git CLI
 *
 * This module provides functional programming utilities that follow
 * the principles of immutability, pure functions, and composition.
 */

// Local Result and Option types
export type Result<E, T> = { readonly _tag: "Ok"; readonly value: T } | { readonly _tag: "Err"; readonly error: E };
export type Option<T> = { readonly _tag: "Some"; readonly value: T } | { readonly _tag: "None" };

export const ok = <E, T>(value: T): Result<E, T> => ({ _tag: "Ok", value });
export const err = <E, T>(error: E): Result<E, T> => ({ _tag: "Err", error });
export const some = <T>(value: T): Option<T> => ({ _tag: "Some", value });
export const none = <T>(): Option<T> => ({ _tag: "None" });

const isSuccess = <E, T>(result: Result<E, T>): result is { _tag: "Ok"; value: T } => result._tag === "Ok";
const mapResultFn = <E, T, U>(result: Result<E, T>, fn: (value: T) => U): Result<E, U> => {
	if (isSuccess(result)) {
		return ok(fn(result.value));
	}
	return result as Result<E, U>;
};
const flatMapResult = <E, T, U>(result: Result<E, T>, fn: (value: T) => Result<E, U>): Result<E, U> => {
	if (isSuccess(result)) {
		return fn(result.value);
	}
	return result as Result<E, U>;
};

// Pipe function for function composition
export const pipe = <T>(value: T, ...fns: Array<(arg: any) => any>): any => {
	return fns.reduce((acc, fn) => fn(acc), value);
};

// Compose function for function composition (right to left)
export const compose = <R>(...fns: Array<(arg: any) => any>): ((...args: any[]) => R) => {
	return (...args: any[]): R => {
		const reversed = fns.reverse();
		if (reversed.length === 0) {
			throw new Error("compose requires at least one function");
		}
		const first = reversed[0]!;
		const rest = reversed.slice(1);
		let firstResult = first(args[0]);
		for (let i = 1; i < args.length; i++) {
			firstResult = first(args[i]);
		}
		return rest.reduce((acc, fn) => fn(acc), firstResult);
	};
};

// Map function for Result
export const mapResult = <E, T, U>(fn: (value: T) => U) => (result: Result<E, T>): Result<E, U> => {
	return mapResultFn(result, fn);
};

// Map function for Option
export const mapOption = <T, U>(fn: (value: T) => U) => (option: Option<T>): Option<U> => {
	if (option._tag === "Some") {
		return some(fn(option.value));
	}
	return option;
};

// Chain function for Result
export const chainResult = <E, T, U>(fn: (value: T) => Result<E, U>) => (result: Result<E, T>): Result<E, U> => {
	return flatMapResult(result, fn);
};

// Chain function for Option
export const chainOption = <T, U>(fn: (value: T) => Option<U>) => (option: Option<T>): Option<U> => {
	if (option._tag === "Some") {
		return fn(option.value);
	}
	return option;
};

// Fold function for Result
export const foldResult =
	<E, T, R>(onError: (error: E) => R, onSuccess: (value: T) => R) => (result: Result<E, T>): R => {
		if (isSuccess(result)) {
			return onSuccess(result.value);
		}
		const errResult = result as { readonly _tag: "Err"; readonly error: E };
		return onError(errResult.error);
	};

// Fold function for Option
export const foldOption = <T, R>(onNone: () => R, onSome: (value: T) => R) => (option: Option<T>): R => {
	if (option._tag === "Some") {
		return onSome(option.value);
	}
	return onNone();
};

// Tap function for side effects
export const tap = <T>(fn: (value: T) => void) => (value: T): T => {
	fn(value);
	return value;
};

// Tap function for Result
export const tapResult = <E, T>(fn: (value: T) => void) => (result: Result<E, T>): Result<E, T> => {
	if (isSuccess(result)) {
		fn(result.value);
	}
	return result;
};

// Tap function for Option
export const tapOption = <T>(fn: (value: T) => void) => (option: Option<T>): Option<T> => {
	if (option._tag === "Some") {
		fn(option.value);
	}
	return option;
};

export default {
	// Result
	mapResult,
	chainResult,
	foldResult,
	tapResult,

	// Option
	mapOption,
	chainOption,
	foldOption,
	tapOption,

	// Composition
	pipe,
	compose,
	tap,
};
