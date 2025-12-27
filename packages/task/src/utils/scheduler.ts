import { err, ok } from "functional";
import type { Schedule, ScheduledTask, ScheduleError } from "../types";
import { scheduleError } from "./creators";

// Type alias - FluentResult from ok/err
type Result<E, A> = ReturnType<typeof ok<E, A>>;

/**
 * Parse cron expression to get next run time
 * Simple implementation - supports basic patterns
 */
export function parseSchedule(
	schedule: Schedule,
	from: Date = new Date(),
): Result<ScheduleError, Date> {
	const fromDate = schedule.timezone ? new Date(from.toLocaleString("en-US", { timeZone: schedule.timezone })) : from;
	try {
		switch (schedule.type) {
			case "once":
				return ok<ScheduleError, Date>(from);

			case "interval":
				if (!schedule.interval) {
					return err<ScheduleError, Date>(
						scheduleError("Interval is required for interval schedule", {
							schedule,
							code: "INVALID_INTERVAL",
						}),
					);
				}
				return ok<ScheduleError, Date>(new Date(from.getTime() + schedule.interval));

			case "daily":
				if (!schedule.time) {
					return err<ScheduleError, Date>(
						scheduleError("Time is required for daily schedule", {
							schedule,
							code: "INVALID_TIME",
						}),
					);
				}
				return parseDailySchedule(schedule.time, fromDate);

			case "weekly":
				if (schedule.dayOfWeek === undefined) {
					return err<ScheduleError, Date>(
						scheduleError("Day of week is required for weekly schedule", {
							schedule,
							code: "INVALID_DAY",
						}),
					);
				}
				return parseWeeklySchedule(schedule.dayOfWeek, schedule.time ?? "00:00", fromDate);

			case "cron":
				if (!schedule.expression) {
					return err<ScheduleError, Date>(
						scheduleError("Expression is required for cron schedule", {
							schedule,
							code: "INVALID_CRON",
						}),
					);
				}
				return parseCronExpression(schedule.expression, fromDate);

			default:
				return err<ScheduleError, Date>(
					scheduleError(`Unknown schedule type: ${schedule.type}`, {
						schedule,
						code: "UNKNOWN_TYPE",
					}),
				);
		}
	} catch (error) {
		return err<ScheduleError, Date>(
			scheduleError("Failed to parse schedule", {
				schedule,
				code: "PARSE_ERROR",
				cause: error as Error,
			}),
		);
	}
}

/**
 * Parse daily schedule (HH:MM format)
 */
function parseDailySchedule(time: string, from: Date): Result<ScheduleError, Date> {
	const [hours, minutes] = time.split(":").map(Number);
	if (hours === undefined || minutes === undefined) {
		return err<ScheduleError, Date>(
			scheduleError(`Invalid time format: ${time}`, {
				code: "INVALID_TIME_FORMAT",
				metadata: { time },
			}),
		);
	}
	if (
		Number.isNaN(hours)
		|| Number.isNaN(minutes)
		|| hours < 0
		|| hours > 23
		|| minutes < 0
		|| minutes > 59
	) {
		return err<ScheduleError, Date>(
			scheduleError(`Invalid time format: ${time}`, {
				code: "INVALID_TIME_FORMAT",
				metadata: { time },
			}),
		);
	}

	const next = new Date(from);
	next.setHours(hours, minutes, 0, 0);

	// If time has passed today, schedule for tomorrow
	if (next <= from) {
		next.setDate(next.getDate() + 1);
	}

	return ok<ScheduleError, Date>(next);
}

/**
 * Parse weekly schedule
 */
function parseWeeklySchedule(
	dayOfWeek: number,
	time: string,
	from: Date,
): Result<ScheduleError, Date> {
	if (dayOfWeek < 0 || dayOfWeek > 6) {
		return err<ScheduleError, Date>(
			scheduleError(`Invalid day of week: ${dayOfWeek}`, {
				code: "INVALID_DAY",
				metadata: { dayOfWeek },
			}),
		);
	}

	const [hours, minutes] = time.split(":").map(Number);
	if (hours === undefined || minutes === undefined) {
		return err<ScheduleError, Date>(
			scheduleError(`Invalid time format: ${time}`, {
				code: "INVALID_TIME_FORMAT",
				metadata: { time },
			}),
		);
	}
	const next = new Date(from);
	const currentDay = next.getDay();
	const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;

	next.setDate(next.getDate() + (daysUntilTarget || 7));
	next.setHours(hours, minutes, 0, 0);

	return ok<ScheduleError, Date>(next);
}

/**
 * Parse cron expression
 * Simplified implementation - supports common patterns
 * Format: "minute hour day month dayOfWeek"
 */
function parseCronExpression(
	expression: string,
	from: Date,
): Result<ScheduleError, Date> {
	const parts = expression.trim().split(/\s+/);
	if (parts.length !== 5) {
		return err<ScheduleError, Date>(
			scheduleError(`Invalid cron expression: ${expression}`, {
				code: "INVALID_CRON_FORMAT",
				metadata: { expression },
			}),
		);
	}

	const [minute, hour, day, month] = parts;

	// Simple implementation - only supports * and numbers
	const next = new Date(from);

	if (minute !== "*") next.setMinutes(Number(minute));
	if (hour !== "*") next.setHours(Number(hour));
	if (day !== "*") next.setDate(Number(day));
	if (month !== "*") next.setMonth(Number(month) - 1);

	// If the scheduled time is in the past, add appropriate time
	if (next <= from) {
		if (minute !== "*" && hour !== "*" && day === "*") {
			next.setDate(next.getDate() + 1); // Daily
		} else if (day !== "*" && month === "*") {
			next.setMonth(next.getMonth() + 1); // Monthly
		} else {
			next.setFullYear(next.getFullYear() + 1); // Yearly
		}
	}

	return ok<ScheduleError, Date>(next);
}

/**
 * Check if task should run
 */
export function shouldRun(task: ScheduledTask, now: Date = new Date()): boolean {
	if (!task.enabled) return false;
	if (!task.nextRun) return false;
	return now >= task.nextRun;
}

/**
 * Update task's next run time
 */
export function updateNextRun<T_IN, T_OUT, E = Error>(
	task: ScheduledTask<T_IN, T_OUT, E>,
): Result<ScheduleError, ScheduledTask<T_IN, T_OUT, E>> {
	const nextRunResult = parseSchedule(task.schedule, new Date());
	if (nextRunResult._tag === "Failure") {
		return nextRunResult as any as Result<ScheduleError, ScheduledTask<T_IN, T_OUT, E>>;
	}

	return ok<ScheduleError, ScheduledTask<T_IN, T_OUT, E>>({
		...task,
		lastRun: new Date(),
		nextRun: nextRunResult.value,
	});
}
