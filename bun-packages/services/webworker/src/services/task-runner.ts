export interface TaskRunnerConfig {
	readonly maxConcurrent: number;
	readonly timeout: number;
}

export class TaskRunner {
	private running = 0;
	private queue: Array<() => Promise<any>> = [];

	constructor(private config: TaskRunnerConfig) {}

	async execute<A>(fn: () => Promise<A>): Promise<A> {
		if (this.running >= this.config.maxConcurrent) {
			return new Promise((resolve, reject) => {
				this.queue.push(async () => {
					try {
						resolve(await fn());
					} catch (error) {
						reject(error);
					}
				});
			});
		}

		this.running++;

		try {
			const result = await Promise.race([
				fn(),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Task timeout")), this.config.timeout),
				),
			]);
			return result as A;
		} finally {
			this.running--;

			if (this.queue.length > 0) {
				const next = this.queue.shift();
				if (next) next();
			}
		}
	}

	getStats() {
		return {
			running: this.running,
			queued: this.queue.length,
		};
	}
}

export const createTaskRunner = (config: TaskRunnerConfig): TaskRunner => {
	return new TaskRunner(config);
};
