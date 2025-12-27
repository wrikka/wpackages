// Constants for schedule package

// Main schedule constants
export const SCHEDULE_CONSTANTS = {
	DEFAULT_TIMEZONE: "UTC",
	MIN_INTERVAL_SECONDS: 1,
	MAX_INTERVAL_DAYS: 365,
	CRON_PARTS_COUNT: 5,
	CRON_SECOND_INDEX: 0,
	CRON_MINUTE_INDEX: 1,
	CRON_HOUR_INDEX: 2,
	CRON_DAY_INDEX: 3,
	CRON_MONTH_INDEX: 4,
	CRON_WEEKDAY_INDEX: 5,
} as const;

export const CRON_PRESETS = {
	EVERY_MINUTE: "* * * * *",
	EVERY_HOUR: "0 * * * *",
	EVERY_DAY: "0 0 * * *",
	EVERY_WEEK: "0 0 * * 0",
	EVERY_MONTH: "0 0 1 * *",
} as const;

export const SCHEDULE_ERRORS = {
	INVALID_CRON_EXPRESSION: "Invalid cron expression",
	INVALID_INTERVAL: "Invalid interval configuration",
	SCHEDULE_NOT_FOUND: "Schedule not found",
	SCHEDULE_ALREADY_EXISTS: "Schedule already exists",
} as const;
