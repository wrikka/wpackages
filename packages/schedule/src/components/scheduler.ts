import { ScheduleConfig } from "../types/index";
import { describeCronExpression } from "../utils/index";

/**
 * Creates a human-readable display string for a schedule configuration
 * @param config - The schedule configuration object
 * @returns A formatted display string showing schedule name, status, and timezone
 */
export const createScheduleDisplay = (config: ScheduleConfig) => {
	const displayName = config.name || "Unnamed Schedule";
	const displayStatus = config.enabled ? "Enabled" : "Disabled";
	const displayTimezone = config.timezone || "UTC";

	return `Schedule: ${displayName} | Status: ${displayStatus} | Timezone: ${displayTimezone}`;
};

/**
 * Formats a cron expression into a human-readable description
 * @param cron - The cron expression string (5 fields: minute hour day month weekday)
 * @returns A human-readable description of when the cron job runs
 */
export const formatCronExpression = (cron: string): string => {
	return describeCronExpression(cron);
};
