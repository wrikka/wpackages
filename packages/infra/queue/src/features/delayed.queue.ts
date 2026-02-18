/**
 * Feature 2: Delayed Queue
 * Queue with delayed message processing
 */

import type {
	DelayedQueue,
	DelayedQueueItem,
	QueueOfferResult,
	QueuePollResult,
	QueueShutdown,
} from "../types";

class DelayedQueueImpl<A> implements DelayedQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "delayed" as const;
	readonly capacity: number | "unbounded";
	readonly _A?: A;
	private items: DelayedQueueItem<A>[] = [];
	private isShutdown = false;
	private waiters: {
		resolve: (value: A) => void;
		reject: (reason: Error) => void;
	}[] = [];
	private checkInterval?: ReturnType<typeof setInterval>;

	constructor(capacity: number | "unbounded" = "unbounded") {
		this.capacity = capacity;
		this.startProcessing();
	}

	get size(): number {
		return this.items.filter((item) => item.executeAt <= Date.now()).length;
	}

	get totalSize(): number {
		return this.items.length;
	}

	get isEmpty(): boolean {
		return this.getReadyItems().length === 0;
	}

	get isFull(): boolean {
		if (this.capacity === "unbounded") return false;
		return this.items.length >= this.capacity;
	}

	private getReadyItems(): DelayedQueueItem<A>[] {
		const now = Date.now();
		return this.items.filter((item) => item.executeAt <= now);
	}

	private startProcessing(): void {
		// Check every 100ms for items that are ready
		this.checkInterval = setInterval(() => {
			this.processReadyItems();
		}, 100);
	}

	private processReadyItems(): void {
		while (this.waiters.length > 0) {
			const readyItems = this.getReadyItems();
			if (readyItems.length === 0) break;

			const item = readyItems[0]!;
			const index = this.items.findIndex((i) => i === item);
			if (index !== -1) {
				this.items.splice(index, 1);
				const waiter = this.waiters.shift()!;
				waiter.resolve(item.value);
			}
		}
	}

	enqueue(item: A, delayMs: number = 0): QueueOfferResult {
		if (this.isShutdown) {
			return { _tag: "OfferFailure", reason: "shutdown" };
		}

		if (this.isFull) {
			return { _tag: "OfferFailure", reason: "full" };
		}

		const now = Date.now();
		const delayedItem: DelayedQueueItem<A> = {
			value: item,
			delayMs,
			executeAt: now + delayMs,
			enqueuedAt: now,
		};

		// Insert sorted by executeAt
		const index = this.items.findIndex((i) => i.executeAt > delayedItem.executeAt);
		if (index === -1) {
			this.items.push(delayedItem);
		} else {
			this.items.splice(index, 0, delayedItem);
		}

		// Try to process immediately if ready
		this.processReadyItems();

		return { _tag: "OfferSuccess" };
	}

	async dequeue(timeoutMs?: number): Promise<A | undefined> {
		if (this.isShutdown && this.getReadyItems().length === 0) {
			return undefined;
		}

		const readyItems = this.getReadyItems();
		if (readyItems.length > 0) {
			const item = readyItems[0]!;
			const index = this.items.findIndex((i) => i === item);
			if (index !== -1) {
				this.items.splice(index, 1);
				return item.value;
			}
		}

		// Wait for an item with timeout
		return new Promise((resolve, reject) => {
			const waiter = { resolve, reject };
			this.waiters.push(waiter);

			if (timeoutMs !== undefined) {
				setTimeout(() => {
					const index = this.waiters.indexOf(waiter);
					if (index !== -1) {
						this.waiters.splice(index, 1);
						resolve(undefined);
					}
				}, timeoutMs);
			}
		});
	}

	async peek(): Promise<A | undefined> {
		const readyItems = this.getReadyItems();
		return readyItems[0]?.value;
	}

	shutdown(): QueueShutdown {
		this.isShutdown = true;
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
		}
		for (const waiter of this.waiters) {
			waiter.reject(new Error("Queue shutdown"));
		}
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	getDelayedItems(): DelayedQueueItem<A>[] {
		const now = Date.now();
		return this.items.filter((item) => item.executeAt > now);
	}

	getNextReadyTime(): number | undefined {
		const readyItems = this.getReadyItems();
		if (readyItems.length > 0) return Date.now();
		return this.items[0]?.executeAt;
	}

	cancelDelayed(itemMatcher: (item: A) => boolean): number {
		let cancelledCount = 0;
		this.items = this.items.filter((item) => {
			if (itemMatcher(item.value)) {
				cancelledCount++;
				return false;
			}
			return true;
		});
		return cancelledCount;
	}
}

export const createDelayedQueue = <A>(capacity: number | "unbounded" = "unbounded"): DelayedQueue<A> => {
	return new DelayedQueueImpl<A>(capacity) as DelayedQueue<A>;
};

export const offerWithDelay = <A>(
	queue: DelayedQueue<A>,
	item: A,
	delayMs: number,
): Promise<QueueOfferResult> => {
	const q = queue as DelayedQueueImpl<A>;
	return Promise.resolve(q.enqueue(item, delayMs));
};

export const takeDelayed = <A>(
	queue: DelayedQueue<A>,
	timeoutMs?: number,
): Promise<QueuePollResult<A>> => {
	const q = queue as DelayedQueueImpl<A>;
	return (async () => {
		const item = await q.dequeue(timeoutMs);
		if (item === undefined) {
			return { _tag: "PollFailure", reason: "timeout" };
		}
		return { _tag: "PollSuccess", value: item };
	})();
};

export const getNextReadyTime = <A>(queue: DelayedQueue<A>): Promise<number | undefined> => {
	const q = queue as DelayedQueueImpl<A>;
	return Promise.resolve(q.getNextReadyTime());
};

export const cancelDelayed = <A>(
	queue: DelayedQueue<A>,
	matcher: (item: A) => boolean,
): Promise<number> => {
	const q = queue as DelayedQueueImpl<A>;
	return Promise.resolve(q.cancelDelayed(matcher));
};
