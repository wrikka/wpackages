/**
 * Prompt Configuration
 * Default settings for prompts
 */

export const PROMPT_CONFIG = Object.freeze(
	{
		/**
		 * Max items to show in autocomplete/search
		 */
		maxAutocompleteItems: 10,

		/**
		 * Debounce delay for search (ms)
		 */
		searchDebounceMs: 150,

		/**
		 * Maximum prompt width
		 */
		maxPromptWidth: 80,

		/**
		 * Enable ANSI colors
		 */
		enableColors: true,

		/**
		 * Enable Unicode symbols
		 */
		enableUnicode: true,
	} as const,
);

export type PromptConfig = typeof PROMPT_CONFIG;
