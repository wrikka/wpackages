import type { PromptDescriptor } from "./prompt-descriptor";

export type Condition<TContext = Record<string, unknown>> = (
	context: TContext,
) => boolean | Promise<boolean>;

export interface ConditionalPrompt<T, TContext = Record<string, unknown>> {
	condition: Condition<TContext>;
	descriptor: PromptDescriptor<T, any>;
}

export interface ConditionalPromptOptions<T, TContext = Record<string, unknown>> {
	context: TContext;
	prompts: ConditionalPrompt<T, TContext>[];
	fallback?: PromptDescriptor<T, any>;
}
