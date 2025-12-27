/**
 * Factory Pattern - Pure functional implementation
 * Creates objects without specifying exact classes
 */

import type { Factory } from "../types";
import { createFunctionSelector } from "../components";

/**
 * Create a simple factory function
 */
export const createFactory =
	<TInput, TOutput>(creator: Factory<TInput, TOutput>): Factory<TInput, TOutput> => (input: TInput): TOutput =>
		creator(input);

/**
 * Create a factory with default values
 */
export const createFactoryWithDefaults = <TInput, TOutput>(
	creator: Factory<TInput, TOutput>,
	defaults: Partial<TInput>,
): Factory<Partial<TInput>, TOutput> =>
(input: Partial<TInput>): TOutput => creator({ ...defaults, ...input } as TInput);

/**
 * Create a conditional factory
 */
export const createConditionalFactory = <TInput, TOutput>(
	factories: ReadonlyArray<{
		readonly condition: (input: TInput) => boolean;
		readonly factory: Factory<TInput, TOutput>;
	}>,
	defaultFactory: Factory<TInput, TOutput>,
): Factory<TInput, TOutput> =>
createFunctionSelector(
	factories.map((f) => ({
		condition: f.condition,
		fn: f.factory,
	})),
	defaultFactory,
);

/**
 * Create a parameterized factory
 */
export const createParameterizedFactory = <TParam, TInput, TOutput>(
	creator: (param: TParam) => Factory<TInput, TOutput>,
) =>
(param: TParam): Factory<TInput, TOutput> => creator(param);

/**
 * Compose multiple factories
 */
export const composeFactories = <TInput, TIntermediate, TOutput>(
	factory1: Factory<TInput, TIntermediate>,
	factory2: Factory<TIntermediate, TOutput>,
): Factory<TInput, TOutput> =>
(input: TInput): TOutput => factory2(factory1(input));

/**
 * Create a memoized factory (caches results)
 */
export const createMemoizedFactory = <TInput extends string | number, TOutput>(
	factory: Factory<TInput, TOutput>,
): Factory<TInput, TOutput> => {
	const cache = new Map<TInput, TOutput>();
	return (input: TInput): TOutput => {
		if (cache.has(input)) {
			return cache.get(input) as TOutput;
		}
		const result = factory(input);
		cache.set(input, result);
		return result;
	};
};

/**
 * Create an abstract factory
 */
export const createAbstractFactory = <T extends Record<string, unknown>>(
	factories: {
		readonly [K in keyof T]: Factory<unknown, T[K]>;
	},
) => ({
	create: <K extends keyof T>(key: K, input: unknown): T[K] => factories[key](input),
});
