import type { Task, TaskResult } from "@wpackages/task";
import type { TaskQueue } from "./types";

export function moveToRunning<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
	task: Task<any, T_OUT, E>,
): TaskQueue<T_OUT, E> {
	return {
		...queue,
		pending: queue.pending.filter((t) => t.id !== task.id),
		running: [...queue.running, task],
	};
}

export function moveToFinished<T_OUT = unknown, E = Error>(
	queue: TaskQueue<T_OUT, E>,
	taskResult: TaskResult<T_OUT, E>,
): TaskQueue<T_OUT, E> {
	const isSuccess = taskResult.status === "completed";
	return {
		...queue,
		running: queue.running.filter((t) => t.id !== taskResult.taskId),
		completed: isSuccess ? [...queue.completed, taskResult] : queue.completed,
		failed: !isSuccess ? [...queue.failed, taskResult] : queue.failed,
	};
}
