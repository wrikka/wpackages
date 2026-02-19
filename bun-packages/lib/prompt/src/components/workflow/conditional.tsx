import { prompt } from "../../lib/context/prompt-context";
import type { ConditionalPrompt, ConditionalPromptOptions } from "../../types/conditional";
import type { PromptDescriptor } from "../../types/prompt-descriptor";

export const conditional = async <T, TContext = Record<string, unknown>>(
	options: ConditionalPromptOptions<T, TContext>,
): Promise<T | null> => {
	const { context, prompts, fallback } = options;

	for (const item of prompts) {
		const shouldShow = await item.condition(context);
		if (shouldShow) {
			const result = await prompt(item.descriptor as PromptDescriptor<T, any>);
			if (result.ok) {
				return result.value;
			}
			return null;
		}
	}

	if (fallback) {
		const result = await prompt(fallback as PromptDescriptor<T, any>);
		if (result.ok) {
			return result.value;
		}
	}

	return null;
};

export const createConditionalPrompt = <T, TContext = Record<string, unknown>>(
	condition: (context: TContext) => boolean | Promise<boolean>,
	descriptor: PromptDescriptor<T, any>,
): ConditionalPrompt<T, TContext> => ({
	condition,
	descriptor,
});
