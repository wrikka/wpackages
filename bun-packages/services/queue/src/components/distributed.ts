/**
 * Distributed queue implementation
 */

import type {
	DistributedQueue,
	DistributedQueueConfig,
	DistributedMessage,
	QueueOfferResult,
} from '../types';

class DistributedQueueImpl<A> implements DistributedQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "distributed" as const;
	readonly capacity: number | "unbounded" = "unbounded";
	readonly _A?: A;
	readonly config: DistributedQueueConfig;
	private items: DistributedMessage<A>[] = [];
	private isShutdown = false;
	private waiters: { resolve: (value: A) => void; reject: (reason: Error) => void }[] = [];
	partitionAssignments: Map<number, string> = new Map();

	constructor(config: DistributedQueueConfig) {
		this.config = config;
		for (let i = 0; i < config.partitionCount; i++) {
			this.partitionAssignments.set(i, config.nodeId);
		}
	}

	get size(): number { return this.items.length; }
	get isEmpty(): boolean { return this.items.length === 0; }
	get isFull(): boolean { return false; }

	private getPartitionKey(item: A): string {
		return JSON.stringify(item);
	}

	private getPartition(key: string): number {
		let hash = 0;
		for (const char of key) {
			hash = ((hash << 5) - hash) + char.charCodeAt(0);
			hash = hash & hash;
		}
		return Math.abs(hash) % this.config.partitionCount;
	}

	enqueue(item: A): QueueOfferResult {
		if (this.isShutdown) return { _tag: "OfferFailure", reason: "shutdown" };
		const partitionKey = this.getPartitionKey(item);
		const message: DistributedMessage<A> = {
			value: item,
			partitionKey,
			nodeId: this.config.nodeId,
			timestamp: Date.now(),
		};
		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(item);
			return { _tag: "OfferSuccess" };
		}
		this.items.push(message);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<A | undefined> {
		if (this.isShutdown && this.items.length === 0) return undefined;
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

	shutdown(): { _tag: "QueueShutdown" } {
		this.isShutdown = true;
		for (const waiter of this.waiters) waiter.reject(new Error("Queue shutdown"));
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	getPartitionInfo(partition: number): { nodeId: string; count: number } {
		const nodeId = this.partitionAssignments.get(partition) ?? this.config.nodeId;
		const count = this.items.filter((item) => this.getPartition(item.partitionKey) === partition).length;
		return { nodeId, count };
	}

	rebalancePartitions(): void {
		// Simulate partition reassignment
		for (let i = 0; i < this.config.partitionCount; i++) {
			this.partitionAssignments.set(i, this.config.nodeId);
		}
	}
}

export const createDistributedQueue = <A>(config: DistributedQueueConfig): DistributedQueue<A> => {
	return new DistributedQueueImpl<A>(config) as DistributedQueue<A>;
};
