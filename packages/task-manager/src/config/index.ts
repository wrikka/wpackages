import { FUZZY_SEARCH_DEFAULTS, MESSAGES, TASK_DEFAULTS, UI_DEFAULTS } from "../constant";

/**
 * Application configuration
 */
export const appConfig = {
	task: TASK_DEFAULTS,
	ui: UI_DEFAULTS,
	fuzzySearch: FUZZY_SEARCH_DEFAULTS,
	messages: MESSAGES,
} as const;

export type AppConfig = typeof appConfig;
