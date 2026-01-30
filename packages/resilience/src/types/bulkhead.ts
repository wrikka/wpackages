/**
 * Bulkhead types
 */

export type BulkheadConfig = {
	readonly maxConcurrent: number;
	readonly maxQueue?: number;
	readonly queueTimeout?: number;
	readonly onRejection?: (reason: string) => void;
	readonly onAcquire?: () => void;
	readonly onRelease?: () => void;
};

export type BulkheadStats = {
	readonly running: number;
	readonly queued: number;
	readonly completed: number;
	readonly rejected: number;
	readonly capacity: number;
	readonly queueCapacity: number;
};

export type BulkheadState = {
	readonly running: number;
	readonly queued: number;
};

export type Bulkhead = {
	readonly execute: <T>(fn: () => Promise<T>) => Promise<T>;
	readonly getStats: () => BulkheadStats;
	readonly getState: () => BulkheadState;
	readonly reset: () => void;
};
