import type { TaskQueue } from "./types";

/**
 * Get queue statistics
 */
export function getQueueStats<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
): {
	pending: number;
	running: number;
	completed: number;
	failed: number;
	total: number;
} {
	return {
		pending: queue.pending.length,
		running: queue.running.length,
		completed: queue.completed.length,
		failed: queue.failed.length,
		total: queue.pending.length
			+ queue.running.length
			+ queue.completed.length
			+ queue.failed.length,
	};
}

/**
 * Clear completed tasks from queue
 */
export function clearCompleted<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
): TaskQueue<T_OUT, E> {
	return {
		...queue,
		completed: [],
	};
}

/**
 * Clear failed tasks from queue
 */
export function clearFailed<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
): TaskQueue<T_OUT, E> {
	return {
		...queue,
		failed: [],
	};
}
