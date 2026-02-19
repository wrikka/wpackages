/**
 * Memory Queue Backend
 * In-memory queue implementation
 */

import type { BoundedQueue, Queue, QueueShutdown, QueueType, UnboundedQueue } from "../types";

/** Internal queue implementation */
export class MemoryQueueImpl<A> implements Queue<A> {
	readonly _tag = "Queue" as const;
	readonly type: QueueType;
	readonly capacity: number | "unbounded";
	readonly _A?: A;
	private items: A[] = [];
	private isShutdown = false;
	private waiters: {
		resolve: (value: A) => void;
		reject: (reason: Error) => void;
	}[] = [];

	constructor(type: QueueType, capacity: number | "unbounded" = "unbounded") {
		this.type = type;
		this.capacity = capacity;
	}

	get size(): number {
		return this.items.length;
	}

	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	get isFull(): boolean {
		if (this.type === "unbounded") return false;
		return this.items.length >= (this.capacity as number);
	}

	enqueue(item: A): { _tag: "OfferSuccess" } | { _tag: "OfferFailure"; reason: "full" | "shutdown" } {
		if (this.isShutdown) {
			return { _tag: "OfferFailure", reason: "shutdown" };
		}

		if (this.type === "bounded" && this.isFull) {
			return { _tag: "OfferFailure", reason: "full" };
		}

		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(item);
			return { _tag: "OfferSuccess" };
		}

		this.items.push(item);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<A | undefined> {
		if (this.isShutdown && this.items.length === 0) {
			return undefined;
		}

		if (this.items.length > 0) {
			return this.items.shift();
		}

		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	async peek(): Promise<A | undefined> {
		return this.items[0];
	}

	shutdown(): QueueShutdown {
		this.isShutdown = true;
		for (const waiter of this.waiters) {
			waiter.reject(new Error("Queue shutdown"));
		}
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}
}

export const createMemoryBoundedQueue = <A>(capacity: number): BoundedQueue<A> => {
	return new MemoryQueueImpl<A>("bounded", capacity) as BoundedQueue<A>;
};

export const createMemoryUnboundedQueue = <A>(): UnboundedQueue<A> => {
	return new MemoryQueueImpl<A>("unbounded", "unbounded") as UnboundedQueue<A>;
};
