export interface FiberId {
	readonly _tag: "FiberId";
	readonly id: number;
}

export interface Fiber<out A, out E> {
	readonly id: FiberId;
	status: "running" | "completed" | "failed" | "cancelled";
	readonly priority: "high" | "medium" | "low";
	readonly createdAt: number;
	startedAt?: number;
	completedAt?: number;
	result?: A;
	error?: E;
	readonly cancelToken: AbortSignal;
	readonly parent?: FiberId;
	children: FiberId[];
}

export interface FiberPool {
	readonly maxConcurrent: number;
	readonly running: Set<FiberId>;
	readonly queued: Array<{ fiber: Fiber<any, any>; priority: number }>;
}

export interface FiberOptions {
	readonly priority?: "high" | "medium" | "low";
	readonly timeout?: number;
	readonly cancelToken?: AbortSignal;
}

export interface FiberMetrics {
	readonly totalFibers: number;
	readonly runningFibers: number;
	readonly queuedFibers: number;
	readonly completedFibers: number;
	readonly failedFibers: number;
	readonly cancelledFibers: number;
	readonly averageExecutionTime: number;
}
