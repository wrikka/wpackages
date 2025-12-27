import type { Schedule, Task, Workflow } from "../types";

/**
 * Validate task
 */
export function isValidTask<T_IN, T_OUT, E>(task: Task<T_IN, T_OUT, E>): boolean {
	return Boolean(task.id && task.name && task.execute);
}

/**
 * Validate schedule
 */
export function isValidSchedule(schedule: Schedule): boolean {
	if (!schedule.type) return false;

	switch (schedule.type) {
		case "once":
			return true;
		case "interval":
			return Boolean(schedule.interval && schedule.interval > 0);
		case "daily":
			return Boolean(schedule.time && /^\d{2}:\d{2}$/.test(schedule.time));
		case "weekly":
			return Boolean(
				schedule.dayOfWeek !== undefined &&
					schedule.dayOfWeek >= 0 &&
					schedule.dayOfWeek <= 6 &&
					schedule.time &&
					/^\d{2}:\d{2}$/.test(schedule.time),
			);
		case "cron":
			return Boolean(schedule.expression && /^(\*|(\d+(-\d+)?)(,(\d+(-\d+)?))*)(\s+(\*|(\d+(-\d+)?)(,(\d+(-\d+)?))*))*$/.test(schedule.expression));
		default:
			return false;
	}
}

/**
 * Validate workflow
 */
export function isValidWorkflow<E>(workflow: Workflow<E>): boolean {
	return Boolean(workflow.id && workflow.name && workflow.steps && workflow.steps.length > 0);
}

/**
 * Check if priority is valid
 */
export function isValidPriority(priority: string): boolean {
	return ["low", "normal", "high", "critical"].includes(priority);
}
