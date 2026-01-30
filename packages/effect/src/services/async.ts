import type { Effect } from "../types";

export const tryPromise = <A, E>(f: () => Promise<A>, onError: (error: unknown) => E): Effect<A, E> => {
	return async () => {
		try {
			return await f();
		} catch (error) {
			throw onError(error);
		}
	};
};

export const sleep = (ms: number): Effect<void> => {
	return async () => {
		await new Promise((resolve) => setTimeout(resolve, ms));
	};
};

export const timeout = <A, E>(effect: Effect<A, E>, ms: number, onTimeout: () => E): Effect<A, E> => {
	return async () => {
		const result = await Promise.race([
			effect(),
			sleep(ms).then(() => {
				throw onTimeout();
			}),
		]);
		return result;
	};
};

export const delay = <A, E>(effect: Effect<A, E>, ms: number): Effect<A, E> => {
	return async () => {
		await sleep(ms)();
		return await effect();
	};
};
