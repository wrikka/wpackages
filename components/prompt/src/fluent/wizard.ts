import { group } from "../components/group";
import { PromptDescriptor, type PromptResult } from "../types";

type WizardPrompts = Record<string, PromptDescriptor<any, any>>;

type WizardResult<T extends WizardPrompts> = {
	[K in keyof T]: T[K] extends PromptDescriptor<infer V, any> ? V : never;
};

type WizardState<T extends WizardPrompts> = Readonly<{
	prompts: T;
	intro?: string | undefined;
	outro?: string | undefined;
}>;

export type WizardBuilder<T extends WizardPrompts> = Readonly<{
	intro: (message: string) => WizardBuilder<T>;
	outro: (message: string) => WizardBuilder<T>;
	step: <K extends string, D extends PromptDescriptor<any, any>>(
		key: K,
		descriptor: D,
	) => WizardBuilder<T & Record<K, D>>;
	run: () => Promise<PromptResult<WizardResult<T>>>;
}>;

const createWizardBuilder = <T extends WizardPrompts>(state: WizardState<T>): WizardBuilder<T> => {
	return Object.freeze({
		intro: (message: string) => createWizardBuilder({ ...state, intro: message }),
		outro: (message: string) => createWizardBuilder({ ...state, outro: message }),
		step: <K extends string, D extends PromptDescriptor<any, any>>(key: K, descriptor: D) => {
			const nextPrompts = { ...(state.prompts as WizardPrompts), [key]: descriptor } as T & Record<K, D>;
			return createWizardBuilder({ ...state, prompts: nextPrompts });
		},
		run: async () => {
			return group({ prompts: state.prompts, intro: state.intro, outro: state.outro }) as Promise<
				PromptResult<WizardResult<T>>
			>;
		},
	});
};

export const wizard = (): WizardBuilder<{}> => createWizardBuilder({ prompts: {} });
