/**
 * Prompt Types - Core type definitions
 */

/**
 * Text prompt options
 */
export interface TextPromptOptions {
	readonly message: string;
	readonly placeholder?: string;
	readonly initial?: string;
	readonly validate?: (value: string) => boolean | string;
}

/**
 * Number prompt options
 */
export interface NumberPromptOptions {
	readonly message: string;
	readonly initial?: number;
	readonly validate?: (v: number) => boolean | string;
}

/**
 * Confirm prompt options
 */
export interface ConfirmPromptOptions {
	readonly message: string;
	readonly initial?: boolean;
}

/**
 * Select prompt option
 */
export interface SelectOption<T> {
	readonly value: T;
	readonly label: string;
	readonly description?: string;
}

/**
 * Select prompt options
 */
export interface SelectPromptOptions<T> {
	readonly message: string;
	readonly options: readonly SelectOption<T>[];
}

/**
 * Multi-select prompt options
 */
export interface MultiSelectPromptOptions<T> {
	readonly message: string;
	readonly options: readonly { readonly value: T; readonly label: string }[];
}

/**
 * Search/Autocomplete prompt options
 */
export interface SearchPromptOptions<T> {
	readonly message: string;
	readonly options: readonly SelectOption<T>[];
	readonly placeholder?: string;
	readonly maxItems?: number;
}
