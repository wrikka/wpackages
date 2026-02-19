/**
 * Delayed queue types
 */

import type { Queue } from './basic';

export interface DelayedQueueItem<A> {
	readonly value: A;
	readonly executeAt: number;
	readonly delayMs: number;
	readonly enqueuedAt: number;
}

export interface DelayedQueue<A> extends Queue<A> {
	readonly type: "delayed";
}
