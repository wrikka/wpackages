import type { WorkerPool, WorkerPoolOptions, WorkerTask } from "./types";

export const createWorkerPool = (_options: WorkerPoolOptions = {}): WorkerPool => {
	const { maxWorkers = 4, idleTimeout = 30000 } = _options;

	let activeWorkers = 0;
	let completedTasks = 0;
	const taskQueue: Array<WorkerTask> = [];
	const idleTimers = new Map<number, NodeJS.Timeout>();

	const processNextTask = async () => {
		if (taskQueue.length === 0) {
			// Set idle timer if no tasks
			if (activeWorkers === 0 && taskQueue.length === 0) {
				const timer = setTimeout(() => {
					// Worker pool can be cleaned up here if needed
				}, idleTimeout);
				idleTimers.set(activeWorkers, timer);
			}
			return;
		}

		const task = taskQueue.shift();
		if (!task) return;

		activeWorkers++;
		try {
			await task.fn();
			completedTasks++;
		} catch (error) {
			// Handle task error
			console.error("Task failed:", error);
		} finally {
			activeWorkers--;
			processNextTask(); // Process next task
		}
	};

	const submit = <R>(fn: () => Promise<R>): Promise<R> => {
		return new Promise<R>((resolve, _reject) => {
			const taskId = Math.random().toString(36).substring(2, 15);
			const task: WorkerTask<R> = {
				id: taskId,
				fn: async () => {
					const result = await fn();
					resolve(result);
					return result;
				},
			};

			taskQueue.push(task as WorkerTask);

			// Start processing if we have available workers
			if (activeWorkers < maxWorkers) {
				processNextTask();
			}
		});
	};

	const submitBatch = async <R>(fns: Array<() => Promise<R>>): Promise<R[]> => {
		const promises = fns.map(fn => submit(fn));
		return Promise.all(promises);
	};

	const getStats = () => ({
		activeWorkers,
		pendingTasks: taskQueue.length,
		completedTasks,
	});

	const terminate = async (): Promise<void> => {
		// Clear all idle timers
		for (const timer of idleTimers.values()) {
			clearTimeout(timer);
		}
		idleTimers.clear();

		// Wait for active workers to complete
		while (activeWorkers > 0) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	};

	return {
		submit,
		submitBatch,
		getStats,
		terminate,
	};
};
