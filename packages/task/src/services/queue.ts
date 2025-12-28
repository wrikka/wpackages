import type { Result } from "../types";
import type { QueueConfig, QueueError, Task, TaskQueue, TaskResult } from "../types";
import { queueError } from "../utils/creators";
import { ok, err } from "../utils/result";

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
	// Sort by priority if enabled
	const pending = [...queue.pending, task];
	if (queue.config.priority) {
		pending.sort((a, b) => {
			const priorities = { low: 0, normal: 1, high: 2, critical: 3 };
			return (
				priorities[b.priority ?? "normal"] - priorities[a.priority ?? "normal"]
			);
		});
	}

	return ok({
		...queue,
		pending,
	}) as Result<QueueError, TaskQueue<T_OUT, E>>;
}

/**
 * Process next task from queue
 */
export async function processNext<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
): Promise<Result<QueueError, TaskQueue<T_OUT, E>>> {
	if (queue.pending.length === 0) {
		return err(
			queueError("Queue is empty", {
				queueName: queue.name,
				code: "QUEUE_EMPTY",
			}),
		) as Result<QueueError, TaskQueue<T_OUT, E>>;
	}

	if (queue.running.length >= (queue.config.maxConcurrent ?? 5)) {
		return err(
			queueError("Queue is full", {
				queueName: queue.name,
				code: "QUEUE_FULL",
				metadata: {
					running: queue.running.length,
					maxConcurrent: queue.config.maxConcurrent,
				},
			}),
		) as Result<QueueError, TaskQueue<T_OUT, E>>;
	}

	const [task, ...remainingPending] = queue.pending;
	if (!task) {
		return err(
			queueError("Queue is empty after check", {
				queueName: queue.name,
				code: "QUEUE_EMPTY",
			}),
		) as Result<QueueError, TaskQueue<T_OUT, E>>;
	}

	const queueWithRunning: TaskQueue<T_OUT, E> = {
		...queue,
		pending: remainingPending,
		running: [...queue.running, task],
	};
	const startedAt = new Date();
	let attempts = 0;
	let result: Result<E, T_OUT> | undefined;
	let lastError: E | undefined;

	// Execute with retries
	while (attempts <= (task.retries ?? queue.config.maxRetries ?? 3)) {
		attempts++;
		try {
			result = await executeWithTimeout(
				() => task.execute(undefined), // Pass undefined as input for standalone tasks
				task.timeout ?? queue.config.timeout ?? 30000,
			);
			if (result._tag === "Success") break;
			lastError = result.error;

			if (attempts <= (task.retries ?? queue.config.maxRetries ?? 3)) {
				await delay(queue.config.retryDelay ?? 1000);
			}
		} catch (catchErr) {
			lastError = catchErr as E;
			result = err(lastError) as Result<E, T_OUT>;
		}
	}

	const completedAt = new Date();
	const taskResult: TaskResult<T_OUT, E> = {
		taskId: task.id,
		status: result && result._tag === "Success" ? "completed" : "failed",
		result,
		startedAt,
		completedAt,
		duration: completedAt.getTime() - startedAt.getTime(),
		attempts,
		error: lastError,
	};

	return ok({
		...queueWithRunning,
		running: queueWithRunning.running.filter((t) => t.id !== task.id),
		completed:
			result && result._tag === "Success" ? [...queueWithRunning.completed, taskResult] : queueWithRunning.completed,
		failed:
			result && result._tag === "Failure" ? [...queueWithRunning.failed, taskResult] : queueWithRunning.failed,
	});
}

/**
 * Execute task with timeout
 */
async function executeWithTimeout<E, T_OUT>(
	fn: () => Promise<Result<E, T_OUT>>,
	timeout: number,
): Promise<Result<E, T_OUT>> {
	return Promise.race([
		fn(),
		new Promise<Result<E, T_OUT>>((_, reject) => setTimeout(() => reject(new Error("Task timeout")), timeout)),
	]);
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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
