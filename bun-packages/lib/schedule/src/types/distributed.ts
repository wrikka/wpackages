import type { Effect } from "effect";

export type LockType = "job" | "scheduler" | "migration";

export interface DistributedLock {
	readonly id: string;
	readonly type: LockType;
	readonly resourceId: string;
	readonly ownerId: string;
	readonly acquiredAt: Date;
	readonly expiresAt: Date;
}

export interface LockOptions {
	readonly ttl: number;
	readonly retryInterval?: number;
	readonly maxRetries?: number;
}

export interface DistributedLockManager {
	readonly acquire: (
		resourceId: string,
		options: LockOptions,
	) => Effect.Effect<DistributedLock>;
	readonly release: (lockId: string) => Effect.Effect<void>;
	readonly extend: (lockId: string, ttl: number) => Effect.Effect<boolean>;
	readonly isLocked: (resourceId: string) => Effect.Effect<boolean>;
	readonly heartbeat: (lockId: string, interval: number) => Effect.Effect<void>;
}
