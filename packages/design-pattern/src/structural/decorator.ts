/**
 * Decorator Pattern - Pure functional implementation
 * Adds behavior to functions dynamically
 */

import { createMemoizedSingleArg } from "../components";

/**
 * Create a decorator that wraps a function with additional behavior
 * @template T - The input type
 * @template TResult - The return type
 * @param baseFunction - The function to decorate
 * @param decorator - The decorator function
 * @returns Decorated function
 */
export const createDecorator = <T, TResult>(
	baseFunction: (value: T) => TResult,
	decorator: (value: T, next: (value: T) => TResult) => TResult,
) =>
(value: T): TResult => decorator(value, baseFunction);

export const createDecoratorChain = <T, TResult>(
	baseFunction: (value: T) => TResult,
	...decorators: ReadonlyArray<
		(value: T, next: (value: T) => TResult) => TResult
	>
): (value: T) => TResult => {
	return decorators.reduceRight<(value: T) => TResult>(
		(acc, decorator) => (value: T) => decorator(value, acc),
		baseFunction,
	);
};

export const createLoggingDecorator = <TArgs extends readonly unknown[], TResult>(
	fn: (...args: TArgs) => TResult,
	logger: (args: TArgs, result: TResult) => void = (args, result) => console.log("Args:", args, "Result:", result),
) =>
(...args: TArgs): TResult => {
	const result = fn(...args);
	logger(args, result);
	return result;
};

export const createCachingDecorator = <
	TArgs extends readonly [string | number],
	TResult,
>(
	fn: (...args: TArgs) => TResult,
) => {
	return createMemoizedSingleArg((arg: TArgs[0]) => fn(...([arg] as unknown as TArgs)));
};
