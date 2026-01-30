export class Semaphore {
	private permits: number;
	private queue: Array<() => void> = [];

	constructor(permits: number) {
		this.permits = permits;
	}

	async acquire(): Promise<void> {
		if (this.permits > 0) {
			this.permits--;
			return;
		}

		return new Promise((resolve) => {
			this.queue.push(resolve);
		});
	}

	release(): void {
		if (this.queue.length > 0) {
			const resolve = this.queue.shift()!;
			resolve();
		} else {
			this.permits++;
		}
	}

	async execute<T>(task: () => Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await task();
		} finally {
			this.release();
		}
	}
}
