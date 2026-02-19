/**
 * Feature 1: Priority Queue
 * Priority-based queue implementation
 */

import type {
	PriorityLevel,
	PriorityQueue,
	PriorityQueueItem,
	QueueOfferResult,
	QueuePollResult,
	QueueShutdown,
} from "../types";

const priorityValues: Record<PriorityLevel, number> = {
	critical: 4,
	high: 3,
	normal: 2,
	low: 1,
};

class PriorityQueueImpl<A> implements PriorityQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "priority" as const;
	readonly capacity: number;
	readonly _A?: A;
	private items: PriorityQueueItem<A>[] = [];
	private isShutdown = false;
	private waiters: {
		resolve: (value: A) => void;
		reject: (reason: Error) => void;
	}[] = [];

	constructor(capacity: number) {
		this.capacity = capacity;
	}

	get size(): number {
		return this.items.length;
	}

	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	get isFull(): boolean {
		return this.items.length >= this.capacity;
	}

	private insertByPriority(item: PriorityQueueItem<A>): void {
		// Insert maintaining priority order (higher priority first)
		const index = this.items.findIndex(
			(existing) =>
				existing.priorityValue < item.priorityValue
				|| (existing.priorityValue === item.priorityValue && existing.enqueuedAt > item.enqueuedAt),
		);
		if (index === -1) {
			this.items.push(item);
		} else {
			this.items.splice(index, 0, item);
		}
	}

	enqueue(item: A, priority: PriorityLevel = "normal"): QueueOfferResult {
		if (this.isShutdown) {
			return { _tag: "OfferFailure", reason: "shutdown" };
		}

		if (this.isFull) {
			return { _tag: "OfferFailure", reason: "full" };
		}

		const priorityItem: PriorityQueueItem<A> = {
			value: item,
			priority,
			priorityValue: priorityValues[priority],
			enqueuedAt: Date.now(),
		};

		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(item);
			return { _tag: "OfferSuccess" };
		}

		this.insertByPriority(priorityItem);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<A | undefined> {
		if (this.isShutdown && this.items.length === 0) {
			return undefined;
		}

		if (this.items.length > 0) {
			return this.items.shift()?.value;
		}

		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	async peek(): Promise<A | undefined> {
		return this.items[0]?.value;
	}

	shutdown(): QueueShutdown {
		this.isShutdown = true;
		for (const waiter of this.waiters) {
			waiter.reject(new Error("Queue shutdown"));
		}
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	getItemsByPriority(priority: PriorityLevel): A[] {
		return this.items
			.filter((item) => item.priority === priority)
			.map((item) => item.value);
	}

	getPriorityDistribution(): Record<PriorityLevel, number> {
		const distribution: Record<PriorityLevel, number> = {
			critical: 0,
			high: 0,
			normal: 0,
			low: 0,
		};
		for (const item of this.items) {
			distribution[item.priority]++;
		}
		return distribution;
	}
}

export const createPriorityQueue = <A>(capacity: number): PriorityQueue<A> => {
	return new PriorityQueueImpl<A>(capacity) as PriorityQueue<A>;
};

export const offerWithPriority = <A>(
	queue: PriorityQueue<A>,
	item: A,
	priority: PriorityLevel,
): Promise<QueueOfferResult> => {
	const q = queue as PriorityQueueImpl<A>;
	return Promise.resolve(q.enqueue(item, priority));
};

export const takePriority = <A>(queue: PriorityQueue<A>): Promise<QueuePollResult<A>> => {
	const q = queue as PriorityQueueImpl<A>;
	return (async () => {
		const item = await q.dequeue();
		if (item === undefined) {
			return { _tag: "PollFailure", reason: "empty" };
		}
		return { _tag: "PollSuccess", value: item };
	})();
};

export const getPriorityDistribution = <A>(
	queue: PriorityQueue<A>,
): Promise<Record<PriorityLevel, number>> => {
	const q = queue as PriorityQueueImpl<A>;
	return Promise.resolve(q.getPriorityDistribution());
};
