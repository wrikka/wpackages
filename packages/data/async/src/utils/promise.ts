import type { Task } from "../types";

export const tryPromise = async <A, E>(
	fn: () => Promise<A>,
	onError: (error: unknown) => E,
): Promise<A> => {
	try {
		return await fn();
	} catch (error) {
		throw onError(error);
	}
};

export const delay = <A>(fn: Task<A>, ms: number): Task<A> => {
	return async () => {
		await new Promise((resolve) => setTimeout(resolve, ms));
		return await fn();
	};
};

export const memoizeAsync = <A extends unknown[], R>(
	fn: (...args: A) => R | Promise<R>,
	options?: { ttl?: number },
): ((...args: A) => Promise<R>) => {
	const cache = new Map<string, { value: R; timestamp: number }>();
	const pending = new Map<string, Promise<R>>();

	const getKey = (args: A): string => {
		return JSON.stringify(args);
	};

	return async (...args: A): Promise<R> => {
		const key = getKey(args);
		const ttl = options?.ttl;

		const cached = cache.get(key);
		if (cached !== undefined) {
			if (ttl === undefined || Date.now() - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		const pendingPromise = pending.get(key);
		if (pendingPromise !== undefined) {
			return pendingPromise;
		}

		const promise = (async (): Promise<R> => {
			const value = await fn(...args);
			cache.set(key, { value, timestamp: Date.now() });
			pending.delete(key);
			return value;
		})();

		pending.set(key, promise);
		return promise;
	};
};
