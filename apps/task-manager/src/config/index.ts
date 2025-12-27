import { ANSI, TERMINAL_DEFAULTS, TASK_DEFAULTS, UI_DEFAULTS, FUZZY_SEARCH_DEFAULTS, MESSAGES } from "../constant";

/**
 * Application configuration
 */
export const appConfig = {
	ansi: ANSI,
	terminal: TERMINAL_DEFAULTS,
	task: TASK_DEFAULTS,
	ui: UI_DEFAULTS,
	fuzzySearch: FUZZY_SEARCH_DEFAULTS,
	messages: MESSAGES,
} as const;

export type AppConfig = typeof appConfig;
