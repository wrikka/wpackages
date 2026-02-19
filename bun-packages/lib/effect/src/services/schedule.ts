import type { Schedule, ScheduleType } from "../types";
import type { Effect } from "../types";

export const fixed = (interval: number): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const cron = (pattern: string): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const and = <A, B>(s1: Schedule<A>, s2: Schedule<B>): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const or = <A, B>(s1: Schedule<A>, s2: Schedule<B>): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const withDelay = <A>(schedule: Schedule<A>, delay: number): Schedule<A> => schedule;

export const forever = (): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const once = (): Schedule<void> => ({
	_tag: "Schedule",
	_A: undefined,
});

export const runWithSchedule = <A, E>(
	effect: Effect<A, E>,
	schedule: Schedule<void>,
): Effect<A[], E> => {
	return async () => {
		const results: A[] = [];
		while (true) {
			try {
				const result = await effect();
				results.push(result);
			} catch (error) {
				throw error;
			}
		}
		return results;
	};
};

export const retryWithSchedule = <A, E>(
	effect: Effect<A, E>,
	schedule: Schedule<void>,
): Effect<A, E | { _tag: "RetryExhausted" }> => {
	return async () => {
		let lastError: E | undefined;
		while (true) {
			try {
				return await effect();
			} catch (error) {
				lastError = error as E;
			}
		}
		throw { _tag: "RetryExhausted" };
	};
};

export const scheduleWithTimeout = <A>(
	schedule: Schedule<A>,
	timeout: number,
): Schedule<A> => schedule;
