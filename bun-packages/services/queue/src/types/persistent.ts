/**
 * Persistent queue types
 */

import type { Queue } from './basic';

export interface PersistentQueueConfig {
	readonly storageType: "file" | "sqlite" | "redis" | "memory";
	readonly path?: string;
	readonly connectionString?: string;
	readonly syncIntervalMs: number;
	readonly autoRecover: boolean;
}

export interface PersistentQueue<A> extends Queue<A> {
	readonly type: "persistent";
	readonly config: PersistentQueueConfig;
	readonly lastPersistedAt: number;
}

export interface PersistenceStatus {
	readonly isPersisted: boolean;
	readonly lastError?: string | undefined;
	readonly pendingWrites: number;
}
