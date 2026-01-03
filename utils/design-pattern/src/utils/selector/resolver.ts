/**
 * Resolves a value that can either be a direct value or a function that produces the value.
 * @param valueOrFn The value or function to resolve.
 * @param input The input to pass to the function if `valueOrFn` is a function.
 * @returns The resolved value.
 */
export const resolveValue = <T, U>(valueOrFn: U | ((input: T) => U), input: T): U => {
	if (typeof valueOrFn === "function") {
		return (valueOrFn as (input: T) => U)(input);
	}
	return valueOrFn;
};

/**
 * Resolves a value that can be a direct value, a Promise, or a function that returns a value or a Promise.
 * @param valueOrFn The value, Promise, or function to resolve.
 * @param input The input to pass to the function if `valueOrFn` is a function.
 * @returns A Promise that resolves to the final value.
 */
export const resolveAsyncValue = <T, U>(
	valueOrFn: U | Promise<U> | ((input: T) => U | Promise<U>),
	input: T,
): Promise<U> => {
	const resolvedFn = typeof valueOrFn === "function" ? (valueOrFn as (input: T) => U | Promise<U>)(input) : valueOrFn;
	return Promise.resolve(resolvedFn);
};
