import { PromptDescriptor } from "./types";

export const group = <T extends Record<string, any>>(
	prompts: {
		[K in keyof T]: PromptDescriptor<T[K]>;
	},
) => {
	// This will be the core logic for handling a sequence of prompts.
	// It will return a promise that resolves with all the answers.
};
