import type { IntegrationError } from "./integration";
import type { RequestConfig, Response } from "./request";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Batch request configuration
 */
export type BatchConfig = {
	readonly maxBatchSize: number;
	readonly maxWaitMs: number;
	readonly concurrency?: number;
	readonly retryFailedItems?: boolean;
};

/**
 * Batch request item
 */
export type BatchItem<T = unknown> = {
	readonly id: string;
	readonly request: RequestConfig;
	readonly context?: T;
};

/**
 * Batch response
 */
export type BatchResponse<T = unknown> = {
	readonly id: string;
	readonly result: ResultType<Response<T>, IntegrationError>;
	readonly duration: number;
	readonly retries: number;
};

/**
 * Batch execution result
 */
export type BatchResult<T = unknown> = {
	readonly successful: readonly BatchResponse<T>[];
	readonly failed: readonly BatchResponse<T>[];
	readonly total: number;
	readonly duration: number;
};

/**
 * Batch processor
 */
export type BatchProcessor<T = unknown, R = unknown> = {
	readonly add: (item: BatchItem<T>) => Promise<string>;
	readonly process: () => Promise<BatchResult<R>>;
	readonly flush: () => Promise<BatchResult<R>>;
	readonly size: () => number;
};

/**
 * Batch strategy
 */
export type BatchStrategy = "immediate" | "delayed" | "adaptive";

/**
 * Batch stats
 */
export type BatchStats = {
	readonly processed: number;
	readonly successful: number;
	readonly failed: number;
	readonly averageBatchSize: number;
	readonly averageDuration: number;
};
