/**
 * Types barrel export
 */

// Basic types
export * from "./basic";
export * from "./operations";

// Feature-specific types
export * from "./advanced";
export * from "./delayed";
export * from "./persistent";
export * from "./priority";

// Batch processing types
export interface BatchConfig {
	readonly batchSize: number;
	readonly maxWaitMs: number;
}

export interface BatchMetadata {
	readonly batchId: string;
	readonly createdAt: number;
	readonly itemCount: number;
	readonly sourceQueue: string;
}

export interface BatchResult<A> {
	readonly items: A[];
	readonly metadata: BatchMetadata;
}
