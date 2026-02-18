/**
 * Feature 3: Persistent Queue
 * Queue with persistence capabilities
 */

import type {
	PersistentQueue,
	PersistentQueueConfig,
	PersistenceStatus,
	QueueOfferResult,
	QueuePollResult,
	QueueShutdown,
} from "../types";

interface PersistedItem<A> {
	value: A;
	enqueuedAt: number;
	retryCount: number;
}

class PersistentQueueImpl<A> implements PersistentQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "persistent" as const;
	readonly capacity: number | "unbounded";
	readonly _A?: A;
	readonly config: PersistentQueueConfig;
	private items: PersistedItem<A>[] = [];
	private isShutdown = false;
	private waiters: { resolve: (value: A) => void; reject: (reason: Error) => void }[] = [];
	lastPersistedAt = 0;
	private pendingWrites = 0;
	private lastError: string | undefined;
	private persistenceInterval?: ReturnType<typeof setInterval>;

	constructor(capacity: number | "unbounded", config: Partial<PersistentQueueConfig> = {}) {
		this.capacity = capacity;
		this.config = {
			storageType: config.storageType ?? "memory",
			syncIntervalMs: config.syncIntervalMs ?? 5000,
			autoRecover: config.autoRecover ?? true,
			...(config.path ? { path: config.path } : {}),
			...(config.connectionString ? { connectionString: config.connectionString } : {}),
		};
		this.startPersistence();
	}

	get size(): number {
		return this.items.length;
	}

	get isEmpty(): boolean {
		return this.items.length === 0;
	}

	get isFull(): boolean {
		if (this.capacity === "unbounded") return false;
		return this.items.length >= this.capacity;
	}

	private startPersistence(): void {
		if (this.config.syncIntervalMs > 0) {
			this.persistenceInterval = setInterval(() => {
				void this.persist();
			}, this.config.syncIntervalMs);
		}
	}

	private async persist(): Promise<void> {
		if (this.items.length === 0) return;
		this.pendingWrites = this.items.length;
		try {
			// In a real implementation, this would write to disk/DB
			this.lastPersistedAt = Date.now();
			this.pendingWrites = 0;
			// Clear lastError on success
			this.lastError = undefined;
		} catch (error) {
			this.lastError = error instanceof Error ? error.message : String(error);
		}
	}

	enqueue(item: A): QueueOfferResult {
		if (this.isShutdown) {
			return { _tag: "OfferFailure", reason: "shutdown" };
		}

		if (this.isFull) {
			return { _tag: "OfferFailure", reason: "full" };
		}

		const persistedItem: PersistedItem<A> = {
			value: item,
			enqueuedAt: Date.now(),
			retryCount: 0,
		};

		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(item);
			return { _tag: "OfferSuccess" };
		}

		this.items.push(persistedItem);
		this.pendingWrites++;
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<A | undefined> {
		if (this.isShutdown && this.items.length === 0) {
			return undefined;
		}

		if (this.items.length > 0) {
			const item = this.items.shift();
			return item?.value;
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
		if (this.persistenceInterval) {
			clearInterval(this.persistenceInterval);
		}
		// Final persist
		void this.persist();
		for (const waiter of this.waiters) {
			waiter.reject(new Error("Queue shutdown"));
		}
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	getPersistenceStatus(): PersistenceStatus {
		return {
			isPersisted: this.pendingWrites === 0,
			...(this.lastError ? { lastError: this.lastError } : {}),
			pendingWrites: this.pendingWrites,
		};
	}

	async recover(): Promise<number> {
		// In a real implementation, this would load from disk/DB
		return this.items.length;
	}
}

export const createPersistentQueue = <A>(
	capacity: number | "unbounded",
	config?: Partial<PersistentQueueConfig>,
): PersistentQueue<A> => {
	return new PersistentQueueImpl<A>(capacity, config) as PersistentQueue<A>;
};

export const offerPersistent = <A>(queue: PersistentQueue<A>, item: A): Promise<QueueOfferResult> => {
	const q = queue as PersistentQueueImpl<A>;
	return Promise.resolve(q.enqueue(item));
};

export const takePersistent = <A>(queue: PersistentQueue<A>): Promise<QueuePollResult<A>> => {
	const q = queue as PersistentQueueImpl<A>;
	return (async () => {
		const item = await q.dequeue();
		if (item === undefined) {
			return { _tag: "PollFailure", reason: "empty" };
		}
		return { _tag: "PollSuccess", value: item };
	})();
};

export const getPersistenceStatus = <A>(queue: PersistentQueue<A>): Promise<PersistenceStatus> => {
	const q = queue as PersistentQueueImpl<A>;
	return Promise.resolve(q.getPersistenceStatus());
};

export const recoverQueue = <A>(queue: PersistentQueue<A>): Promise<number> => {
	const q = queue as PersistentQueueImpl<A>;
	return q.recover();
};
