import type { Result, Task, TaskResult } from "@wpackages/task";
import { err } from "@wpackages/task";
import type { QueueConfig } from "./types";
import { delay, executeWithTimeout } from "./utils";

export async function runTask<T_OUT = unknown, E = Error>(
	task: Task<any, T_OUT, E>,
	config: QueueConfig,
): Promise<TaskResult<T_OUT, E>> {
	const startedAt = new Date();
	let attempts = 0;
	let result: Result<E, T_OUT> | undefined;
	let lastError: E | undefined;

	const maxRetries = task.retries ?? config.maxRetries ?? 3;
	const retryDelay = config.retryDelay ?? 1000;
	const timeout = task.timeout ?? config.timeout ?? 30000;

	// Execute with retries
	while (attempts <= maxRetries) {
		attempts++;
		try {
			result = await executeWithTimeout(
				() => task.execute(undefined), // Pass undefined as input for standalone tasks
				timeout,
			);
			if (result._tag === "Success") {
				break;
			}
			lastError = result.error;

			if (attempts <= maxRetries) {
				await delay(retryDelay);
			}
		} catch (catchErr) {
			const error = catchErr instanceof Error ? catchErr : new Error(String(catchErr));
			lastError = error as E;
			result = err(lastError);
		}
	}

	const completedAt = new Date();
	return {
		taskId: task.id,
		status: result && result._tag === "Success" ? "completed" : "failed",
		result,
		startedAt,
		completedAt,
		duration: completedAt.getTime() - startedAt.getTime(),
		attempts,
		error: lastError,
	};
}
