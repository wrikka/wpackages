export type PromptState = "initial" | "active" | "submit" | "cancel" | "error";

export type PromptResult<T> =
	| { ok: true; value: T }
	| { ok: false; reason: "cancel" };

export const cancelResult = Object.freeze({ ok: false as const, reason: "cancel" as const });

export const okResult = <T>(value: T): PromptResult<T> => ({ ok: true, value });

export const isCancel = <T>(result: PromptResult<T>): result is { ok: false; reason: "cancel" } => !result.ok;

export interface BasePromptOptions<T> {
	message: string;
	initialValue?: T;
	validate?: (value: T) => string | undefined;
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

export interface NotePromptOptions extends BasePromptOptions<undefined> {
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

export interface FileSystemPromptOptions extends BasePromptOptions<string> {
	root?: string;
}

export interface TableRow<T> {
	value: T;
	data: Record<string, string | number>;
}

export interface TablePromptOptions<T> extends BasePromptOptions<T> {
	headers: string[];
	rows: TableRow<T>[];
}

export interface TreeNode<T> {
	value: T;
	label: string;
	children?: TreeNode<T>[];
	expanded?: boolean;
}

export interface TreeSelectPromptOptions<T> extends BasePromptOptions<T> {
	nodes: TreeNode<T>[];
}

// We will add more component-specific options here later
