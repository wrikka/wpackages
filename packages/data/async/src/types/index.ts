export type Task<A, _E = unknown> = () => Promise<A>;

export type Deferred<A> = {
	readonly promise: Promise<A>;
	readonly resolve: (value: A | PromiseLike<A>) => void;
	readonly reject: (reason?: unknown) => void;
};

export type RetryOptions = {
	readonly maxAttempts?: number;
	readonly delay?: number;
	readonly backoff?: "constant" | "linear" | "exponential";
	readonly backoffFactor?: number;
	readonly maxDelay?: number;
	readonly jitter?: boolean;
	readonly signal?: AbortSignal;
	readonly onRetry?: (attempt: number, error: unknown) => void;
};

export type ParallelOptions = {
	readonly concurrency?: number;
	readonly signal?: AbortSignal;
};

export type QueueOptions<A> = {
	readonly concurrency?: number;
	readonly priority?: (task: A) => number;
	readonly signal?: AbortSignal;
};

export type AsyncTask<A, E = unknown> = {
	readonly id: string;
	readonly run: Task<A, E>;
	readonly priority?: number;
	readonly signal?: AbortSignal;
};

export type AsyncTaskResult<A, E = unknown> =
	| { readonly success: true; readonly value: A }
	| { readonly success: false; readonly error: E };

export type TimeoutOptions = {
	readonly message?: string;
	readonly signal?: AbortSignal;
};

export type SleepOptions = {
	readonly signal?: AbortSignal | undefined;
};

export type DebounceOptions = {
	readonly wait: number;
	readonly leading?: boolean;
	readonly trailing?: boolean;
	readonly maxWait?: number;
};

export type ThrottleOptions = {
	readonly wait: number;
	readonly leading?: boolean;
	readonly trailing?: boolean;
};
