export type PromptState = "initial" | "active" | "submit" | "cancel" | "error";

export interface BasePromptOptions<T> {
	message: string;
	initialValue?: T;
	validate?: (value: T) => string | void;
}

export interface TextPromptOptions extends BasePromptOptions<string> {
	placeholder?: string;
}

export interface ConfirmPromptOptions extends BasePromptOptions<boolean> {
	positive?: string;
	negative?: string;
}

export interface PasswordPromptOptions extends BasePromptOptions<string> {}

export interface Option<T> {
	value: T;
	label: string;
	hint?: string;
}

export interface SelectPromptOptions<T> extends BasePromptOptions<T> {
	options: Option<T>[];
}

export interface MultiSelectPromptOptions<T> extends BasePromptOptions<T[]> {
	options: Option<T>[];
}

export interface NumberPromptOptions extends BasePromptOptions<number> {
	min?: number;
	max?: number;
	step?: number;
}

export interface SliderPromptOptions extends BasePromptOptions<number> {
	min?: number;
	max?: number;
	step?: number;
	barWidth?: number;
}

export interface RatingPromptOptions extends BasePromptOptions<number> {
	max?: number;
	character?: string;
}

export interface DatePromptOptions extends BasePromptOptions<Date> {}

export interface TimePromptOptions extends BasePromptOptions<Date> {}

export interface TogglePromptOptions extends BasePromptOptions<boolean> {
	active?: string;
	inactive?: string;
}

export interface NotePromptOptions extends BasePromptOptions<void> {
	title?: string;
	type?: "info" | "success" | "warning" | "error";
}

import Spinner from "ink-spinner";
import React from "react";

export interface SpinnerPromptOptions<T> {
	message: string;
	type?: React.ComponentProps<typeof Spinner>["type"];
	action: () => Promise<T>;
}

export interface AutocompletePromptOptions<T> extends BasePromptOptions<T> {
	options: Option<T>[];
	placeholder?: string;
}

// We will add more component-specific options here later
