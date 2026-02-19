/**
 * Bulkhead service implementation
 */

import { Effect } from "effect";
import { BulkheadRejectionError } from "../errors";
import type { Bulkhead, BulkheadConfig, BulkheadState, BulkheadStats } from "../types";

type QueueItem<T> = {
	readonly fn: () => Promise<T>;
	readonly resolve: (value: T) => void;
	readonly reject: (error: Error) => void;
} & ({ readonly timeoutId: NodeJS.Timeout } | { readonly timeoutId?: never });

export const createBulkhead = (config: BulkheadConfig): Bulkhead => {
	const maxConcurrent = config.maxConcurrent;
	const maxQueue = config.maxQueue ?? Number.POSITIVE_INFINITY;
	const queueTimeout = config.queueTimeout;

	let running = 0;
	let completed = 0;
	let rejected = 0;

	const queue: QueueItem<unknown>[] = [];

	const processNext = async (): Promise<void> => {
		if (queue.length === 0 || running >= maxConcurrent) {
			return;
		}

		const item = queue.shift();
		if (!item) return;

		if (item.timeoutId) {
			clearTimeout(item.timeoutId);
		}

		running++;
		config.onAcquire?.();

		try {
			const result = await item.fn();
			item.resolve(result);
			completed++;
		} catch (error) {
			item.reject(error as Error);
		} finally {
			running--;
			config.onRelease?.();
			processNext();
		}
	};

	const execute = <T>(fn: () => Promise<T>): Promise<T> => {
		return new Promise<T>((resolve, reject) => {
			if (running < maxConcurrent) {
				running++;
				config.onAcquire?.();

				fn()
					.then((result) => {
						completed++;
						resolve(result);
					})
					.catch((error) => {
						reject(error);
					})
					.finally(() => {
						running--;
						config.onRelease?.();
						processNext();
					});

				return;
			}

			if (queue.length >= maxQueue) {
				rejected++;
				const error = new BulkheadRejectionError("Queue is full");
				config.onRejection?.("Queue capacity exceeded");
				reject(error);
				return;
			}

			let timeoutId: NodeJS.Timeout | undefined;

			if (queueTimeout) {
				timeoutId = setTimeout(() => {
					const index = queue.findIndex((item) => item === queueItem);
					if (index !== -1) {
						queue.splice(index, 1);
						rejected++;
						config.onRejection?.("Queue timeout");
						reject(
							new BulkheadRejectionError(
								`Queued request timed out after ${queueTimeout}ms`,
							),
						);
					}
				}, queueTimeout);
			}

			const queueItem: QueueItem<T> = timeoutId !== undefined
				? { fn, reject, resolve, timeoutId }
				: { fn, reject, resolve };

			queue.push(queueItem as QueueItem<unknown>);
		});
	};

	const getStats = (): BulkheadStats => ({
		capacity: maxConcurrent,
		completed,
		queueCapacity: maxQueue,
		queued: queue.length,
		rejected,
		running,
	});

	const getState = (): BulkheadState => ({
		queued: queue.length,
		running,
	});

	const reset = (): void => {
		queue.forEach((item) => {
			if (item.timeoutId) {
				clearTimeout(item.timeoutId);
			}
			item.reject(new BulkheadRejectionError("Bulkhead reset"));
		});

		queue.length = 0;
		running = 0;
		completed = 0;
		rejected = 0;
	};

	return {
		execute,
		getState,
		getStats,
		reset,
	};
};

// Effect-based bulkhead
export const bulkheadEffect = <T>(
	bulkhead: Bulkhead,
	effect: Effect.Effect<T, Error>,
): Effect.Effect<T, Error> =>
	Effect.tryPromise({
		try: () => bulkhead.execute(() => Effect.runPromise(effect)),
		catch: (error) => new Error(`Bulkhead execution failed: ${error}`),
	});

// Bulkhead config factory
export const createBulkheadConfig = (
	partial: Partial<BulkheadConfig>,
): BulkheadConfig => ({
	maxConcurrent: partial.maxConcurrent ?? 10,
	...(partial.maxQueue !== undefined && { maxQueue: partial.maxQueue }),
	...(partial.queueTimeout !== undefined && {
		queueTimeout: partial.queueTimeout,
	}),
	...(partial.onRejection && { onRejection: partial.onRejection }),
	...(partial.onAcquire && { onAcquire: partial.onAcquire }),
	...(partial.onRelease && { onRelease: partial.onRelease }),
});

// Default bulkhead configuration
export const defaultBulkheadConfig: BulkheadConfig = {
	maxConcurrent: 10,
	maxQueue: Number.POSITIVE_INFINITY,
};
