/**
 * Strategy Pattern - Pure functional implementation
 */

import type { Strategy } from "../types";
import { selectFunctionByCondition } from "../components";

export const createStrategy = <TInput, TOutput>(
	strategy: Strategy<TInput, TOutput>,
): Strategy<TInput, TOutput> => strategy;

export const createStrategySelector = <TInput, TOutput>(
	strategies: Record<string, Strategy<TInput, TOutput>>,
	defaultStrategy: Strategy<TInput, TOutput>,
) => ({
	execute: (key: string, input: TInput): TOutput => {
		const strategy = strategies[key] ?? defaultStrategy;
		return strategy(input);
	},
});

export const createConditionalStrategy = <TInput, TOutput>(
	strategies: ReadonlyArray<{
		readonly condition: (input: TInput) => boolean;
		readonly strategy: Strategy<TInput, TOutput>;
	}>,
	defaultStrategy: Strategy<TInput, TOutput>,
): Strategy<TInput, TOutput> =>
(input: TInput): TOutput =>
	selectFunctionByCondition(
		input,
		strategies.map((s) => ({
			condition: s.condition,
			fn: s.strategy,
		})),
		defaultStrategy,
	);
