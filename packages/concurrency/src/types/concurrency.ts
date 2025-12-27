/**
 * Concurrency types
 */

export interface DebounceOptions {
	delay: number;
}

export interface ThrottleOptions {
	delay: number;
}

export interface RetryOptions {
	attempts: number;
	delay?: number;
	backoff?: "linear" | "exponential";
}

export interface TimeoutOptions {
	ms: number;
}

export interface MutexOptions {
	name?: string;
}

export interface QueueOptions<T> {
	capacity?: number;
	initialItems?: T[];
}

export type AsyncTask<T> = () => Promise<T>;

export type AsyncFunction<
	T extends readonly unknown[] = readonly unknown[],
	R = unknown,
> = (...args: T) => Promise<R>;
