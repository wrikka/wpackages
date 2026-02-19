/**
 * Dead letter queue implementation
 */

import type {
	DeadLetterQueue,
	DeadLetterConfig,
	DeadLetterItem,
	QueueOfferResult,
} from '../types';

class DeadLetterQueueImpl<A> implements DeadLetterQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "unbounded" as const;
	readonly capacity = "unbounded" as const;
	readonly _A?: A;
	readonly parentQueue: string;
	readonly deadLetterConfig: DeadLetterConfig;
	private items: DeadLetterItem<A>[] = [];
	private isShutdown = false;
	private waiters: { resolve: (value: DeadLetterItem<A>) => void; reject: (reason: Error) => void }[] = [];

	constructor(parentQueue: string, config: DeadLetterConfig) {
		this.parentQueue = parentQueue;
		this.deadLetterConfig = config;
	}

	get size(): number { return this.items.length; }
	get isEmpty(): boolean { return this.items.length === 0; }
	get isFull(): boolean { return false; }

	addDeadLetter(item: A, error: Error, retryCount: number): QueueOfferResult {
		if (this.isShutdown) return { _tag: "OfferFailure", reason: "shutdown" };
		const deadItem: DeadLetterItem<A> = {
			originalValue: item,
			failedAt: Date.now(),
			errorMessage: error.message,
			retryCount,
			originalQueue: this.parentQueue,
		};
		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(deadItem);
			return { _tag: "OfferSuccess" };
		}
		this.items.push(deadItem);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<DeadLetterItem<A> | undefined> {
		if (this.isShutdown && this.items.length === 0) return undefined;
		if (this.items.length > 0) return this.items.shift();
		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	async peek(): Promise<DeadLetterItem<A> | undefined> {
		return this.items[0];
	}

	shutdown(): { _tag: "QueueShutdown" } {
		this.isShutdown = true;
		for (const waiter of this.waiters) waiter.reject(new Error("Queue shutdown"));
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	retryItem(item: DeadLetterItem<A>): A | undefined {
		if (item.retryCount < this.deadLetterConfig.maxRetries) {
			return item.originalValue;
		}
		return undefined;
	}

	getRetryableItems(): DeadLetterItem<A>[] {
		return this.items.filter((item) => item.retryCount < this.deadLetterConfig.maxRetries);
	}
}

export const createDeadLetterQueue = <A>(parentQueue: string, config: DeadLetterConfig): DeadLetterQueue<A> => {
	return new DeadLetterQueueImpl<A>(parentQueue, config) as DeadLetterQueue<A>;
};

export const getRetryableItems = <A>(queue: DeadLetterQueue<A>): Promise<DeadLetterItem<A>[]> => {
	const q = queue as DeadLetterQueueImpl<A>;
	return Promise.resolve(q.getRetryableItems());
};
