import {
	autocomplete,
	confirm,
	date,
	filesystem,
	multiselect,
	note,
	number,
	password,
	rating,
	select,
	slider,
	spinner,
	table,
	text,
	time,
	toggle,
	treeselect,
} from "../../components";
import type { PromptTheme } from "../../constants/theme";
import type {
	AutocompletePromptOptions,
	ConfirmPromptOptions,
	DatePromptOptions,
	FileSystemPromptOptions,
	MultiSelectPromptOptions,
	NotePromptOptions,
	NumberPromptOptions,
	PasswordPromptOptions,
	PromptDescriptor,
	PromptResult,
	RatingPromptOptions,
	SelectPromptOptions,
	SliderPromptOptions,
	SpinnerPromptOptions,
	TablePromptOptions,
	TextPromptOptions,
	TimePromptOptions,
	TogglePromptOptions,
	TreeSelectPromptOptions,
} from "../../types";
import { prompt } from "../context/prompt-context";

type AskState<T> = Readonly<{
	descriptor: PromptDescriptor<T, any> | null;
	theme?: Partial<PromptTheme> | undefined;
}>;

export type AskBuilder<T> = Readonly<{
	theme: (theme: Partial<PromptTheme>) => AskBuilder<T>;
	text: (options: TextPromptOptions) => AskBuilder<string>;
	password: (options: PasswordPromptOptions) => AskBuilder<string>;
	confirm: (options: ConfirmPromptOptions) => AskBuilder<boolean>;
	toggle: (options: TogglePromptOptions) => AskBuilder<boolean>;
	number: (options: NumberPromptOptions) => AskBuilder<number>;
	slider: (options: SliderPromptOptions) => AskBuilder<number>;
	rating: (options: RatingPromptOptions) => AskBuilder<number>;
	date: (options: DatePromptOptions) => AskBuilder<Date>;
	time: (options: TimePromptOptions) => AskBuilder<Date>;
	note: (options: NotePromptOptions) => AskBuilder<undefined>;
	filesystem: (options: FileSystemPromptOptions) => AskBuilder<string>;
	select: <TValue>(options: SelectPromptOptions<TValue>) => AskBuilder<TValue>;
	multiselect: <TValue>(options: MultiSelectPromptOptions<TValue>) => AskBuilder<TValue[]>;
	autocomplete: <TValue>(options: AutocompletePromptOptions<TValue>) => AskBuilder<TValue>;
	table: <TValue>(options: TablePromptOptions<TValue>) => AskBuilder<TValue>;
	treeselect: <TValue>(options: TreeSelectPromptOptions<TValue>) => AskBuilder<TValue>;
	spinner: <TValue>(options: SpinnerPromptOptions<TValue>) => AskBuilder<TValue>;
	run: () => Promise<PromptResult<T>>;
}>;

const createAskBuilder = <T>(state: AskState<T>): AskBuilder<T> => {
	const withDescriptor = <TNext>(descriptor: PromptDescriptor<TNext, any>): AskBuilder<TNext> =>
		createAskBuilder({ descriptor, theme: state.theme });

	return Object.freeze({
		theme: (themeOverrides: Partial<PromptTheme>) => createAskBuilder({ ...state, theme: themeOverrides }),
		text: (options: TextPromptOptions) => withDescriptor(text(options)),
		password: (options: PasswordPromptOptions) => withDescriptor(password(options)),
		confirm: (options: ConfirmPromptOptions) => withDescriptor(confirm(options)),
		toggle: (options: TogglePromptOptions) => withDescriptor(toggle(options)),
		number: (options: NumberPromptOptions) => withDescriptor(number(options)),
		slider: (options: SliderPromptOptions) => withDescriptor(slider(options)),
		rating: (options: RatingPromptOptions) => withDescriptor(rating(options)),
		date: (options: DatePromptOptions) => withDescriptor(date(options)),
		time: (options: TimePromptOptions) => withDescriptor(time(options)),
		note: (options: NotePromptOptions) => withDescriptor(note(options)),
		filesystem: (options: FileSystemPromptOptions) => withDescriptor(filesystem(options)),
		select: <TValue>(options: SelectPromptOptions<TValue>) => withDescriptor(select(options)),
		multiselect: <TValue>(options: MultiSelectPromptOptions<TValue>) => withDescriptor(multiselect(options)),
		autocomplete: <TValue>(options: AutocompletePromptOptions<TValue>) => withDescriptor(autocomplete(options)),
		table: <TValue>(options: TablePromptOptions<TValue>) => withDescriptor(table(options)),
		treeselect: <TValue>(options: TreeSelectPromptOptions<TValue>) => withDescriptor(treeselect(options)),
		spinner: <TValue>(options: SpinnerPromptOptions<TValue>) => withDescriptor(spinner(options)),
		run: async () => {
			if (!state.descriptor) {
				throw new Error("ask().run() requires a prompt to be selected first");
			}
			return prompt(state.descriptor as PromptDescriptor<T, any>, state.theme ? { theme: state.theme } : {});
		},
	});
};

export const ask = (): AskBuilder<never> => createAskBuilder({ descriptor: null });
