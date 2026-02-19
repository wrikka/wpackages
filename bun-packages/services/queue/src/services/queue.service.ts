/**
 * Queue Service
 * Main queue operations and factory functions
 */

import type {
	BoundedQueue,
	Queue,
	QueueOfferResult,
	QueuePollResult,
	QueueShutdown,
	QueueType,
	UnboundedQueue,
} from "../types";

/** Internal queue implementation */
class QueueImpl<A> implements Queue<A> {
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

	enqueue(item: A): QueueOfferResult {
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

/** Create a bounded queue with specified capacity */
export const createBoundedQueue = <A>(capacity: number): BoundedQueue<A> => {
	return new QueueImpl<A>("bounded", capacity) as BoundedQueue<A>;
};

/** Create an unbounded queue */
export const createUnboundedQueue = <A>(): UnboundedQueue<A> => {
	return new QueueImpl<A>("unbounded", "unbounded") as UnboundedQueue<A>;
};

/** Offer an item to the queue */
export const offer = <A>(queue: Queue<A>, item: A): Promise<QueueOfferResult> => {
	const q = queue as QueueImpl<A>;
	return Promise.resolve(q.enqueue(item));
};

/** Offer multiple items to the queue */
export const offerAll = <A>(queue: Queue<A>, items: Iterable<A>): Promise<QueueOfferResult[]> => {
	const q = queue as QueueImpl<A>;
	const results: QueueOfferResult[] = [];
	for (const item of items) {
		results.push(q.enqueue(item));
	}
	return Promise.resolve(results);
};

/** Take an item from the queue */
export const take = <A>(queue: Queue<A>): Promise<QueuePollResult<A>> => {
	const q = queue as QueueImpl<A>;
	return (async () => {
		const item = await q.dequeue();
		if (item === undefined) {
			return { _tag: "PollFailure", reason: "empty" };
		}
		return { _tag: "PollSuccess", value: item };
	})();
};

/** Take all items from the queue */
export const takeAll = <A>(queue: Queue<A>): Promise<A[]> => {
	const q = queue as QueueImpl<A>;
	return (async () => {
		const items: A[] = [];
		while (!q.isEmpty) {
			const item = await q.dequeue();
			if (item !== undefined) {
				items.push(item);
			}
		}
		return items;
	})();
};

/** Peek at the next item without removing it */
export const peek = <A>(queue: Queue<A>): Promise<A | undefined> => {
	const q = queue as QueueImpl<A>;
	return q.peek();
};

/** Get queue size */
export const size = <A>(queue: Queue<A>): Promise<number> => {
	return Promise.resolve(queue.size);
};

/** Check if queue is empty */
export const isEmpty = <A>(queue: Queue<A>): Promise<boolean> => {
	return Promise.resolve(queue.isEmpty);
};

/** Check if queue is full */
export const isFull = <A>(queue: Queue<A>): Promise<boolean> => {
	return Promise.resolve(queue.isFull);
};

/** Shutdown the queue */
export const shutdown = <A>(queue: Queue<A>): Promise<QueueShutdown> => {
	const q = queue as QueueImpl<A>;
	return Promise.resolve(q.shutdown());
};

/** Execute function with queue and auto-shutdown */
export const withQueue = <A, R>(
	queue: Queue<A>,
	use: (queue: Queue<A>) => Promise<R>,
): Promise<R> => {
	return (async () => {
		try {
			return await use(queue);
		} finally {
			await shutdown(queue);
		}
	})();
};
