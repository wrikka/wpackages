import type { ParallelOptions, Task } from "../types";

export const parallel = async <const Tasks extends readonly Task<any>[]>(
	tasks: Tasks,
	options: ParallelOptions = {},
): Promise<{ [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>> }> => {
	const { concurrency = Number.POSITIVE_INFINITY, signal } = options;

	if (signal?.aborted) {
		throw signal.reason ?? new Error("parallel: aborted");
	}

	if (concurrency >= tasks.length) {
		return Promise.all(tasks.map((task) => task())) as Promise<{
			[K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>>;
		}>;
	}

	return new Promise((resolve, reject) => {
		const results: unknown[] = new Array(tasks.length);
		let currentIndex = 0;
		let activeCount = 0;
		let hasError = false;

		const runNext = async (): Promise<void> => {
			if (hasError || signal?.aborted) return;

			const index = currentIndex++;
			if (index >= tasks.length) {
				if (activeCount === 0) {
					resolve(results as { [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>> });
				}
				return;
			}

			activeCount++;
			try {
				results[index] = await tasks[index]();
			} catch (error) {
				hasError = true;
				reject(error);
				return;
			}
			activeCount--;
			await runNext();
		};

		for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
			runNext();
		}
	});
};

export const series = async <const Tasks extends readonly Task<any>[]>(
	tasks: Tasks,
): Promise<{ [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>> }> => {
	const results: unknown[] = [];

	for (const task of tasks) {
		results.push(await task());
	}

	return results as { [K in keyof Tasks]: Awaited<ReturnType<Tasks[K]>> };
};

export const waterfall = async <A>(
	initial: A,
	fns: ((value: A) => A | Promise<A>)[],
): Promise<A> => {
	let value: A = initial;

	for (const fn of fns) {
		value = await fn(value);
	}

	return value;
};
