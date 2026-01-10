/**
 * Default configuration values
 */
export const TASK_DEFAULTS = {
	SUPPORTED_FILES: ["wtask.config.json", "tasks.toml", "tasks.ini"],
	EXAMPLES_PATH: "examples",
} as const;

export const UI_DEFAULTS = {
	HEADER_HEIGHT: 3,
	FOOTER_HEIGHT: 2,
} as const;

export const FUZZY_SEARCH_DEFAULTS = {
	CONSECUTIVE_MATCH_BONUS: 2,
	BASE_SCORE: 1,
} as const;
