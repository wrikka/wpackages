export interface JitterStrategy {
	readonly _tag: "JitterStrategy";
	calculate(attempt: number, baseDelay: number): number;
}

export interface RetryWithJitterConfig {
	readonly maxRetries: number;
	readonly baseDelay: number;
	readonly maxDelay: number;
	readonly jitter: JitterStrategy;
}
