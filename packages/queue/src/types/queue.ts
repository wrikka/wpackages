import type { Task, TaskResult } from "@wpackages/task";

/**
 * Queue configuration
 */
export interface QueueConfig {
	readonly maxConcurrent?: number | undefined; // max parallel tasks
	readonly maxRetries?: number | undefined;
	readonly retryDelay?: number | undefined; // milliseconds
	readonly timeout?: number | undefined; // milliseconds
	readonly priority?: boolean | undefined; // enable priority queue
}

/**
 * Task queue
 */
export interface TaskQueue<T_OUT = unknown, E = Error> {
	readonly name: string;
	readonly config: QueueConfig;
	readonly pending: Task<any, T_OUT, E>[];
	readonly running: Task<any, T_OUT, E>[];
	readonly completed: TaskResult<T_OUT, E>[];
	readonly failed: TaskResult<T_OUT, E>[];
}

