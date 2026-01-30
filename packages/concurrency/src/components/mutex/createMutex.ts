import type { Mutex } from "./types";

export const createMutex = (): Mutex => {
	let locked = false;
	const queue: Array<() => void> = [];

	const acquire = (): Promise<void> => {
		return new Promise<void>((resolve) => {
			if (!locked) {
				locked = true;
				resolve();
			} else {
				queue.push(() => resolve());
			}
		});
	};

	const release = (): void => {
		if (queue.length > 0) {
			const next = queue.shift();
			next?.();
		} else {
			locked = false;
		}
	};

	const runExclusive = async <T>(callback: () => Promise<T>): Promise<T> => {
		await acquire();
		try {
			return await callback();
		} finally {
			release();
		}
	};

	return {
		acquire,
		release,
		runExclusive,
	};
};
