import type { TaskQueue, TaskResult } from "../types";
import { processNext } from "./queue";

export interface QueueWorker<T_OUT, E> {
	start: () => void;
	stop: () => void;
	on: (event: "task:start" | "task:complete" | "task:fail", listener: (result: TaskResult<T_OUT, E>) => void) => void;
}

export function createQueueWorker<T_OUT, E>(queue: TaskQueue<T_OUT, E>): QueueWorker<T_OUT, E> {
	let running = false;
	const listeners: Record<string, Function[]> = {};

	const emit = (event: string, data: any) => {
		if (listeners[event]) {
			listeners[event].forEach(listener => listener(data));
		}
	};

	const work = async () => {
		if (!running) return;

		const nextTask = queue.pending[0];
		if (nextTask) {
			emit("task:start", {
				taskId: nextTask.id,
				status: "running",
				startedAt: new Date(),
				attempts: 0,
			});
		}

		const prevCompletedCount = queue.completed.length;
		const prevFailedCount = queue.failed.length;

		const result = await processNext(queue);
		if (result._tag === "Success") {
			queue = result.value;
			if (queue.completed.length > prevCompletedCount) {
				const lastCompleted = queue.completed[queue.completed.length - 1];
				if (lastCompleted) {
					emit("task:complete", lastCompleted);
				}
			} else if (queue.failed.length > prevFailedCount) {
				const lastFailed = queue.failed[queue.failed.length - 1];
				if (lastFailed) {
					emit("task:fail", lastFailed);
				}
			}
		} else if (result.error.code === "QUEUE_EMPTY") {
			// Queue is empty, wait for a moment
			await new Promise(resolve => setTimeout(resolve, 1000));
		} else {
			const lastFailed = queue.failed[queue.failed.length - 1];
			if (lastFailed) {
				emit("task:fail", lastFailed);
			}
		}

		work();
	};

	return {
		start: () => {
			if (running) return;
			running = true;
			work();
		},
		stop: () => {
			running = false;
		},
		on: (event, listener) => {
			if (!listeners[event]) {
				listeners[event] = [];
			}
			listeners[event].push(listener);
		},
	};
}
