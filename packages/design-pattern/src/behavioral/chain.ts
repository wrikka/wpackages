/**
 * Chain of Responsibility Pattern - Pure functional implementation
 */

import type { Handler } from "../types";

export const createChain = <TInput, TOutput>(
	handlers: ReadonlyArray<Handler<TInput, TOutput>>,
	defaultValue?: TOutput,
) => ({
	handle: (input: TInput): TOutput | undefined => {
		for (const handler of handlers) {
			const result = handler(input);
			if (result !== undefined) {
				return result;
			}
		}
		return defaultValue;
	},
});

export const composeHandlers = <TInput, TOutput>(
	...handlers: ReadonlyArray<Handler<TInput, TOutput>>
): Handler<TInput, TOutput> =>
(input: TInput): TOutput | undefined => {
	for (const handler of handlers) {
		const result = handler(input);
		if (result !== undefined) {
			return result;
		}
	}
	return undefined;
};
