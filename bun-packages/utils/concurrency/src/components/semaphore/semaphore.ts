import type { Semaphore } from "./types";

export const createSemaphore = (maxConcurrency: number): Semaphore => {
	if (maxConcurrency <= 0) {
		throw new Error("Max concurrency must be greater than 0");
	}

	let currentPermits = 0;
	const queue: Array<() => void> = [];

	const acquire = (permits = 1): Promise<void> => {
		if (permits > maxConcurrency) {
			throw new Error(`Cannot acquire ${permits} permits when max concurrency is ${maxConcurrency}`);
		}

		return new Promise<void>((resolve) => {
			if (currentPermits + permits <= maxConcurrency) {
				currentPermits += permits;
				resolve();
			} else {
				queue.push(() => {
					currentPermits += permits;
					resolve();
				});
			}
		});
	};

	const release = (permits = 1): void => {
		currentPermits -= permits;

		// Release waiting tasks if possible
		while (queue.length > 0 && currentPermits < maxConcurrency) {
			const next = queue.shift();
			if (next) {
				next();
			}
		}
	};

	const runExclusive = async <T>(callback: () => Promise<T>, permits = 1): Promise<T> => {
		await acquire(permits);
		try {
			return await callback();
		} finally {
			release(permits);
		}
	};

	return {
		acquire,
		release,
		runExclusive,
	};
};
