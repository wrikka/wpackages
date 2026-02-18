import {
	delay as asyncDelay,
	sleep as asyncSleep,
	tryPromise as asyncTryPromise,
	withTimeout,
} from "@wpackages/async";
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
		await asyncSleep(ms);
	};
};

export const timeout = <A, E>(effect: Effect<A, E>, ms: number, onTimeout: () => E): Effect<A, E> => {
	return async () => {
		try {
			return await withTimeout(effect(), ms);
		} catch {
			throw onTimeout();
		}
	};
};

export const delay = <A, E>(effect: Effect<A, E>, ms: number): Effect<A, E> => {
	return asyncDelay(effect, ms);
};

export { asyncTryPromise, asyncSleep, asyncDelay, withTimeout };
