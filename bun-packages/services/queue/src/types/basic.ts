/**
 * Basic queue types
 */

export type QueueType = "bounded" | "unbounded" | "priority" | "delayed" | "persistent" | "distributed";

export interface QueueItem<A> {
	readonly id: string;
	readonly data: A;
	readonly priority: number;
	readonly delay: number;
	readonly createdAt: number;
	readonly scheduledFor?: number | undefined;
}

export interface QueueOptions {
	readonly maxSize?: number;
	readonly concurrency?: number;
	readonly timeout?: number;
}

export interface Queue<A> {
	readonly _tag: "Queue";
	readonly type: QueueType;
	readonly capacity: number | "unbounded";
	readonly size: number;
	readonly isEmpty: boolean;
	readonly isFull: boolean;
	readonly _A?: A;
}

export interface BoundedQueue<A> extends Queue<A> {
	readonly type: "bounded";
	readonly capacity: number;
}

export interface UnboundedQueue<A> extends Queue<A> {
	readonly type: "unbounded";
	readonly capacity: "unbounded";
}
