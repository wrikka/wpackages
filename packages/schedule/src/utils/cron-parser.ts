import { Data, Effect } from "effect";
import { SCHEDULE_CONSTANTS } from "../constant/index";
import type { Interval } from "../types/index";

// Define a custom error for cron parsing failures
export class CronParseError extends Data.TaggedError("CronParseError")<{
	reason: string;
}> {}

/**
 * Validates a single cron field value
 * @param field - The cron field value (can be asterisk, a number, or asterisk/N)
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns True if the field is valid, false otherwise
 */
const isValidCronField = (field: string, min: number, max: number): boolean => {
	if (field === "*") return true;

	// Handle */N pattern (e.g., */5)
	if (field.startsWith("*/")) {
		const step = Number.parseInt(field.slice(2), 10);
		return !Number.isNaN(step) && step > 0 && step <= max - min + 1;
	}

	const num = Number.parseInt(field, 10);
	return !Number.isNaN(num) && num >= min && num <= max;
};

/**
 * Parses a cron expression into its interval components
 * @param cron - The cron expression string (5 fields: minute hour day month weekday)
 * @returns A Result containing the parsed interval or an error message
 */
export const parseCronExpression = (
	cron: string,
): Effect.Effect<Interval, CronParseError> =>
	Effect.try({
		try: () => {
			const parts = cron.trim().split(/\s+/);

			if (parts.length !== SCHEDULE_CONSTANTS.CRON_PARTS_COUNT) {
				throw new CronParseError({
					reason: "Invalid cron expression: incorrect number of parts",
				});
			}

			const [minute = "", hour = "", day = "", month = "", weekday = ""] =
				parts;

			if (!isValidCronField(minute, 0, 59)) {
				throw new CronParseError({
					reason: "Invalid cron expression: minute field out of range",
				});
			}
			if (!isValidCronField(hour, 0, 23)) {
				throw new CronParseError({
					reason: "Invalid cron expression: hour field out of range",
				});
			}
			if (!isValidCronField(day, 1, 31)) {
				throw new CronParseError({
					reason: "Invalid cron expression: day field out of range",
				});
			}
			if (!isValidCronField(month, 1, 12)) {
				throw new CronParseError({
					reason: "Invalid cron expression: month field out of range",
				});
			}
			if (!isValidCronField(weekday, 0, 6)) {
				throw new CronParseError({
					reason: "Invalid cron expression: weekday field out of range",
				});
			}

			return {
				seconds: 0,
				minutes: minute === "*" ? 1 : Number.parseInt(minute, 10),
				hours: hour === "*" ? 0 : Number.parseInt(hour, 10),
				days: day === "*" ? 0 : Number.parseInt(day, 10),
			};
		},
		catch: (unknown) =>
			new CronParseError({
				reason: `Failed to parse cron expression: ${unknown instanceof Error ? unknown.message : "Unknown error"}`,
			}),
	});

// Validate a cron expression
export const validateCronExpression = (cron: string): boolean => {
	try {
		const parts = cron.trim().split(/\s+/);
		if (parts.length !== SCHEDULE_CONSTANTS.CRON_PARTS_COUNT) {
			return false;
		}

		// Validate each field
		const minute = parts[0] ?? "";
		const hour = parts[1] ?? "";
		const day = parts[2] ?? "";
		const month = parts[3] ?? "";
		const weekday = parts[4] ?? "";

		return (
			isValidCronField(minute, 0, 59) &&
			isValidCronField(hour, 0, 23) &&
			isValidCronField(day, 1, 31) &&
			isValidCronField(month, 1, 12) &&
			isValidCronField(weekday, 0, 6)
		);
	} catch {
		return false;
	}
};

// Get cron expression description
export const describeCronExpression = (cron: string): string => {
	if (!validateCronExpression(cron)) {
		return "Invalid cron expression";
	}

	const parts = cron.trim().split(/\s+/);
	const descriptions = [
		parts[0] === "*" ? "every minute" : `at minute ${parts[0]}`,
		parts[1] === "*" ? "every hour" : `at hour ${parts[1]}`,
		parts[2] === "*" ? "every day" : `on day ${parts[2]}`,
		parts[3] === "*" ? "every month" : `in month ${parts[3]}`,
		parts[4] === "*" ? "every weekday" : `on weekday ${parts[4]}`,
	];

	return `Runs ${descriptions.join(", ")}`;
};
