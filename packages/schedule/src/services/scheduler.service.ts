import { ScheduleConfig } from "../types/index";

/**
 * Service interface for managing scheduled tasks
 */
export interface SchedulerService {
	readonly scheduleTask: (config: ScheduleConfig, task: () => void) => Promise<void>;
	readonly cancelTask: (name: string) => Promise<void>;
	readonly listTasks: () => Promise<string[]>;
}

/**
 * Implementation of the scheduler service
 * Manages task scheduling and cancellation
 */
export class SchedulerServiceImpl implements SchedulerService {
	private tasks = new Map<string, NodeJS.Timeout>();

	/**
	 * Schedule a new task
	 * @param config - Schedule configuration
	 * @param task - Task function to execute
	 * @throws Error if task with same name already exists
	 */
	scheduleTask = async (config: ScheduleConfig, task: () => void): Promise<void> => {
		// Validate the schedule configuration
		if (config.name && this.tasks.has(config.name)) {
			throw new Error(`Task with name ${config.name} already exists`);
		}

		// For simplicity, we're using a basic interval
		// In a real implementation, this would use the cron expression
		const timeout = setTimeout(task, 1000); // 1 second interval for demo

		if (config.name) {
			this.tasks.set(config.name, timeout);
		}
	};

	/**
	 * Cancel a scheduled task
	 * @param name - Task name to cancel
	 * @throws Error if task not found
	 */
	cancelTask = async (name: string): Promise<void> => {
		const timeout = this.tasks.get(name);
		if (!timeout) {
			throw new Error(`Task with name ${name} not found`);
		}

		clearTimeout(timeout);
		this.tasks.delete(name);
	};

	/**
	 * List all scheduled tasks
	 * @returns Array of task names
	 */
	listTasks = async (): Promise<string[]> => {
		return Array.from(this.tasks.keys());
	};
}

// Create a live instance of the scheduler service
export const schedulerService = new SchedulerServiceImpl();
