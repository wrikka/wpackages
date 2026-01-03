import type { Result } from "@wpackages/task";
import { err, ok } from "@wpackages/task";
import { queueError } from "./errors";
import { moveToFinished, moveToRunning } from "./queue-state";
import { runTask } from "./task-runner";
import type { QueueError, TaskQueue } from "./types";

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
		);
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
		);
	}

	const [task] = queue.pending;
	if (!task) {
		// This should theoretically not be reached if pending.length > 0
		return err(queueError("Invalid state: No task found in pending queue", {
			queueName: queue.name,
			code: "STATE_INVALID",
		}));
	}

	const queueWithRunning = moveToRunning(queue, task);

	const taskResult = await runTask(task, queue.config);

	const finalQueue = moveToFinished(queueWithRunning, taskResult);

	return ok(finalQueue);
}
