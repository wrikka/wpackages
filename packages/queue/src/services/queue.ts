import type { Result, Task } from "@wpackages/task";
import { ok } from "@wpackages/task";
import type { QueueConfig, QueueError, TaskQueue } from "./types";

/**
 * Create a task queue
 */
export function createQueue<T_OUT = unknown, E = Error>(
	name: string,
	config: QueueConfig = {},
): TaskQueue<T_OUT, E> {
	return {
		name,
		config: {
			maxConcurrent: config.maxConcurrent ?? 5,
			maxRetries: config.maxRetries ?? 3,
			retryDelay: config.retryDelay ?? 1000,
			timeout: config.timeout ?? 30000,
			priority: config.priority ?? false,
		},
		pending: [],
		running: [],
		completed: [],
		failed: [],
	};
}

/**
 * Add task to queue
 */
export function enqueue<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
	task: Task<any, T_OUT, E>,
): Result<QueueError, TaskQueue<T_OUT, E>> {
	const newPending = [...queue.pending, task];

	if (queue.config.priority) {
		newPending.sort((a, b) => {
			const priorities = { low: 0, normal: 1, high: 2, critical: 3 };
			return (
				priorities[b.priority ?? "normal"] - priorities[a.priority ?? "normal"]
			);
		});
	}

	return ok({
		...queue,
		pending: newPending,
	});
}
