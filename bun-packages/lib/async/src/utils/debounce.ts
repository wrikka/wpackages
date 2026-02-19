import type { DebounceOptions } from "../types";

export const debounce = <A extends unknown[], R>(
	fn: (...args: A) => R | Promise<R>,
	options: DebounceOptions,
): ((...args: A) => Promise<R>) => {
	const { wait, leading = false, trailing = true, maxWait } = options;

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: A | undefined;
	let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;

	const invokeFn = async (): Promise<R> => {
		if (lastArgs === undefined) return undefined as R;
		const args = lastArgs;
		lastArgs = undefined;
		return await fn(...args);
	};

	return async (...args: A): Promise<R> => {
		lastArgs = args;

		if (leading && timeoutId === undefined) {
			return await fn(...args);
		}

		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				timeoutId = undefined;
				if (trailing && lastArgs !== undefined) {
					try {
						resolve(await invokeFn());
					} catch (error) {
						reject(error);
					}
				}
			}, wait);

			if (maxWait !== undefined) {
				if (maxTimeoutId !== undefined) {
					clearTimeout(maxTimeoutId);
				}
				maxTimeoutId = setTimeout(async () => {
					maxTimeoutId = undefined;
					if (lastArgs !== undefined) {
						try {
							resolve(await invokeFn());
						} catch (error) {
							reject(error);
						}
					}
				}, maxWait);
			}
		});
	};
};
