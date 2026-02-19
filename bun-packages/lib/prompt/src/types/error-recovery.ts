export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorRecoveryStrategy {
	retry: boolean;
	maxRetries?: number;
	retryDelay?: number;
	fallback?: unknown;
	rollback?: boolean;
}

export interface ErrorHandlingOptions {
	strategy?: ErrorRecoveryStrategy;
	onError?: (error: Error) => void | Promise<void>;
	onRetry?: (attempt: number, error: Error) => void | Promise<void>;
	logErrors?: boolean;
	silent?: boolean;
}

export interface ErrorContext {
	error: Error;
	attempt: number;
	maxAttempts: number;
	canRetry: boolean;
	shouldFallback: boolean;
}

export interface RecoveryResult {
	success: boolean;
	value?: unknown;
	error?: Error;
	attempts: number;
}
