export interface Semaphore {
	readonly _tag: "Semaphore";
	readonly permits: number;
	readonly available: number;
	readonly waiting: number;
}

export interface SemaphoreAcquireResult {
	readonly _tag: "SemaphoreAcquireResult";
}

export interface AcquireSuccess extends SemaphoreAcquireResult {
	readonly _tag: "AcquireSuccess";
	readonly release: () => void;
}

export interface AcquireFailure extends SemaphoreAcquireResult {
	readonly _tag: "AcquireFailure";
	readonly reason: "timeout" | "shutdown";
}

export interface SemaphoreRelease {
	readonly _tag: "SemaphoreRelease";
}
