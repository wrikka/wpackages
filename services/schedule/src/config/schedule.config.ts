import { SCHEDULE_CONSTANTS } from "../constant/index";

// Default schedule configuration
const defaultScheduleConfig = {
	name: "default-schedule",
	enabled: true,
	timezone: SCHEDULE_CONSTANTS.DEFAULT_TIMEZONE,
} as const;

// Frozen configuration object
export const defaultScheduleConfiguration = Object.freeze(
	defaultScheduleConfig,
);
