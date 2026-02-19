import type { ThrottleOptions } from "../types";

export const throttle = <A extends unknown[], R>(
	fn: (...args: A) => R | Promise<R>,
	options: ThrottleOptions,
): ((...args: A) => Promise<R | undefined>) => {
	const { wait, leading = true, trailing = true } = options;

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: A | undefined;
	let lastCallTime = 0;

	const invokeFn = async (): Promise<R> => {
		if (lastArgs === undefined) return undefined as R;
		const args = lastArgs;
		lastArgs = undefined;
		return await fn(...args);
	};

	return async (...args: A): Promise<R | undefined> => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCallTime;

		lastArgs = args;

		if (leading && timeSinceLastCall >= wait) {
			lastCallTime = now;
			return await fn(...args);
		}

		if (timeoutId !== undefined) {
			return undefined;
		}

		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				timeoutId = undefined;
				lastCallTime = Date.now();
				if (trailing && lastArgs !== undefined) {
					try {
						resolve(await invokeFn());
					} catch (error) {
						reject(error);
					}
				} else {
					resolve(undefined);
				}
			}, wait - timeSinceLastCall);
		});
	};
};
