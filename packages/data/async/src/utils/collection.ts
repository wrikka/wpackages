import type { Task } from "../types";

export const each = async <A, B>(
	items: readonly A[],
	fn: (item: A, index: number) => B | Promise<B>,
): Promise<void> => {
	for (let i = 0; i < items.length; i++) {
		await fn(items[i]!, i);
	}
};

export const mapLimit = async <A, B>(
	items: readonly A[],
	concurrency: number,
	fn: (item: A, index: number) => B | Promise<B>,
): Promise<B[]> => {
	const results: B[] = [];
	let currentIndex = 0;
	let activeCount = 0;
	let hasError = false;
	let errorValue: unknown;

	return new Promise((resolve, reject) => {
		const runNext = async (): Promise<void> => {
			if (hasError) return;

			const index = currentIndex++;
			if (index >= items.length) {
				if (activeCount === 0) {
					resolve(results);
				}
				return;
			}

			activeCount++;
			try {
				results[index] = await fn(items[index]!, index);
			} catch (error) {
				hasError = true;
				errorValue = error;
				reject(error);
				return;
			}
			activeCount--;
			await runNext();
		};

		for (let i = 0; i < Math.min(concurrency, items.length); i++) {
			void runNext();
		}
	});
};

export const filterLimit = async <A>(
	items: readonly A[],
	concurrency: number,
	predicate: (item: A, index: number) => boolean | Promise<boolean>,
): Promise<A[]> => {
	const results: A[] = [];
	const checks = await mapLimit(items, concurrency, async (item, index) => ({
		item,
		keep: await predicate(item, index),
	}));

	for (const check of checks) {
		if (check.keep) {
			results.push(check.item);
		}
	}

	return results;
};

export const forever = async <A>(
	fn: () => A | Promise<A>,
	onError?: (error: unknown) => void | Promise<void>,
): Promise<void> => {
	while (true) {
		try {
			await fn();
		} catch (error) {
			if (onError) {
				await onError(error);
			} else {
				throw error;
			}
		}
	}
};

export const until = async (
	condition: () => boolean | Promise<boolean>,
	fn: () => void | Promise<void>,
): Promise<void> => {
	while (!(await condition())) {
		await fn();
	}
};

export const whilst = async (
	condition: () => boolean | Promise<boolean>,
	fn: () => void | Promise<void>,
): Promise<void> => {
	while (await condition()) {
		await fn();
	}
};

export const raceAll = async <const Tasks extends readonly Task<any>[]>(
	tasks: Tasks,
): Promise<{ [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>> }> => {
	return Promise.all(tasks.map((task) => task())) as Promise<{
		[K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>>;
	}>;
};

export const some = async <A>(
	items: readonly A[],
	concurrency: number,
	predicate: (item: A) => boolean | Promise<boolean>,
): Promise<boolean> => {
	const results = await mapLimit(items, concurrency, predicate);
	return results.some(Boolean);
};

export const every = async <A>(
	items: readonly A[],
	concurrency: number,
	predicate: (item: A) => boolean | Promise<boolean>,
): Promise<boolean> => {
	const results = await mapLimit(items, concurrency, predicate);
	return results.every(Boolean);
};
