import type { Effect, ScheduleType } from "../types";
import { sleep } from "./async";

export const retry = <A, E>(
	effect: Effect<A, E>,
	schedule: ScheduleType,
): Effect<A, E> => {
	return async () => {
		let lastError: E | undefined;
		let attempt = 0;

		while (true) {
			try {
				return await effect();
			} catch (error) {
				lastError = error as E;
				attempt++;

				const shouldRetry = await shouldRetryAgain(attempt, schedule);
				if (!shouldRetry) {
					throw lastError;
				}

				const delayMs = getDelay(attempt, schedule);
				await sleep(delayMs)();
			}
		}
	};
};

export const compose = (
	schedule1: ScheduleType,
	schedule2: ScheduleType,
): ScheduleType => {
	return {
		_tag: "Composed",
		schedule1,
		schedule2,
	};
};

const shouldRetryAgain = async (
	attempt: number,
	schedule: ScheduleType,
): Promise<boolean> => {
	if (schedule._tag === "Recurs") {
		return attempt <= schedule.n;
	}
	if (schedule._tag === "Composed") {
		const shouldRetry1 = await shouldRetryAgain(attempt, schedule.schedule1);
		const shouldRetry2 = await shouldRetryAgain(attempt, schedule.schedule2);
		return shouldRetry1 && shouldRetry2;
	}
	return true;
};

const getDelay = (attempt: number, schedule: ScheduleType): number => {
	if (schedule._tag === "Spaced") {
		return schedule.duration;
	}
	if (schedule._tag === "Exponential") {
		return schedule.baseDelay * schedule.factor ** (attempt - 1);
	}
	if (schedule._tag === "Composed") {
		const delay1 = getDelay(attempt, schedule.schedule1);
		const delay2 = getDelay(attempt, schedule.schedule2);
		return Math.max(delay1, delay2);
	}
	return 1000;
};

export const recurs = (n: number): ScheduleType => ({
	_tag: "Recurs",
	n,
});

export const spaced = (duration: number): ScheduleType => ({
	_tag: "Spaced",
	duration,
});

export const exponential = (
	baseDelay: number,
	factor: number = 2,
): ScheduleType => ({
	_tag: "Exponential",
	baseDelay,
	factor,
});
