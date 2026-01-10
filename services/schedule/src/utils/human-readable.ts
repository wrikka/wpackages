import { Effect } from "effect";
import { CronParseError } from "../utils/cron-parser";

export interface HumanSchedule {
	readonly interval:
		| "second"
		| "minute"
		| "hour"
		| "day"
		| "week"
		| "month"
		| "year";
	readonly value: number;
	readonly at?: {
		readonly hour?: number;
		readonly minute?: number;
		readonly dayOfWeek?: number;
		readonly dayOfMonth?: number;
	};
}

export const parseHumanReadable = (
	input: string,
): Effect.Effect<string, CronParseError> => {
	const normalized = input.toLowerCase().trim();

	const patterns = [
		{
			regex: /^every (\d+) seconds?$/,
			handler: (match: RegExpMatchArray) => `*/${match[1]} * * * * *`,
		},
		{
			regex: /^every (\d+) minutes?$/,
			handler: (match: RegExpMatchArray) => `*/${match[1]} * * * *`,
		},
		{
			regex: /^every (\d+) hours?$/,
			handler: (match: RegExpMatchArray) => `0 */${match[1]} * * *`,
		},
		{
			regex: /^every (\d+) days?$/,
			handler: (match: RegExpMatchArray) => `0 0 */${match[1]} * *`,
		},
		{
			regex: /^every (\d+) weeks?$/,
			handler: (_match: RegExpMatchArray) => "0 0 * * 0",
		},
		{
			regex: /^every (\d+) months?$/,
			handler: (match: RegExpMatchArray) => `0 0 1 */${match[1]} *`,
		},
		{
			regex: /^every minute$/,
			handler: () => "* * * * *",
		},
		{
			regex: /^every hour$/,
			handler: () => "0 * * * *",
		},
		{
			regex: /^every day$/,
			handler: () => "0 0 * * *",
		},
		{
			regex: /^every week$/,
			handler: (_match: RegExpMatchArray) => "0 0 * * 0",
		},
		{
			regex: /^every month$/,
			handler: (_match: RegExpMatchArray) => "0 0 1 * *",
		},
		{
			regex: /^daily at (\d{1,2}):(\d{2})$/,
			handler: (match: RegExpMatchArray) => `${match[2]} ${match[1]} * * *`,
		},
		{
			regex:
				/^weekly on (monday|tuesday|wednesday|thursday|friday|saturday|sunday) at (\d{1,2}):(\d{2})$/,
			handler: (match: RegExpMatchArray) => {
				const days = {
					monday: 1,
					tuesday: 2,
					wednesday: 3,
					thursday: 4,
					friday: 5,
					saturday: 6,
					sunday: 0,
				};
				const day = days[match[1] as keyof typeof days];
				return `${match[3]} ${match[2]} * * ${day}`;
			},
		},
		{
			regex: /^monthly on day (\d{1,2}) at (\d{1,2}):(\d{2})$/,
			handler: (match: RegExpMatchArray) =>
				`${match[3]} ${match[2]} ${match[1]} * *`,
		},
		{
			regex: /^at (\d{1,2}):(\d{2})$/,
			handler: (match: RegExpMatchArray) => `${match[2]} ${match[1]} * * *`,
		},
	];

	for (const pattern of patterns) {
		const match = normalized.match(pattern.regex);
		if (match) {
			return Effect.succeed(pattern.handler(match));
		}
	}

	return Effect.fail(
		new CronParseError({ reason: `Invalid human-readable schedule: ${input}` }),
	);
};

export const toHumanReadable = (cron: string): string => {
	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) {
		return "Invalid cron expression";
	}

	const [minute, hour, day, month, weekday] = parts;

	if (
		minute === "*" &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every minute";
	}

	if (
		minute === "0" &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every hour";
	}

	if (
		minute === "0" &&
		hour === "0" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every day at midnight";
	}

	if (
		minute === "0" &&
		hour === "0" &&
		day === "*" &&
		month === "*" &&
		weekday === "0"
	) {
		return "Every week on Sunday at midnight";
	}

	if (
		minute === "0" &&
		hour === "0" &&
		day === "1" &&
		month === "*" &&
		weekday === "*"
	) {
		return "Every month on the 1st at midnight";
	}

	if (
		minute?.startsWith("*/") &&
		hour === "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		const interval = minute.slice(2);
		return `Every ${interval} minutes`;
	}

	if (
		minute === "0" &&
		hour?.startsWith("*/") &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		const interval = hour.slice(2);
		return `Every ${interval} hours`;
	}

	if (
		minute !== "*" &&
		hour !== "*" &&
		day === "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return `Daily at ${hour}:${minute}`;
	}

	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	if (
		minute !== "*" &&
		hour !== "*" &&
		day === "*" &&
		month === "*" &&
		weekday !== "*"
	) {
		return `Weekly on ${days[Number.parseInt(weekday || "0", 10)]} at ${hour}:${minute}`;
	}

	if (
		minute !== "*" &&
		hour !== "*" &&
		day !== "*" &&
		month === "*" &&
		weekday === "*"
	) {
		return `Monthly on day ${day} at ${hour}:${minute}`;
	}

	return cron;
};
