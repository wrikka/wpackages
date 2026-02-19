export type AsyncResult<T, E = Error> = Promise<{ success: true; value: T } | { success: false; error: E }>;

export type RetryOptions = {
	maxAttempts?: number;
	delay?: number;
	backoff?: "linear" | "exponential";
	jitter?: boolean;
};

export type FallbackOptions<T = unknown> = {
	onError?: (error: unknown) => void;
	logErrors?: boolean;
	defaultValue?: T;
};
