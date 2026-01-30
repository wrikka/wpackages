export type BatchProcessorOptions = {
	batchSize?: number;
	flushInterval?: number; // milliseconds
	concurrency?: number;
	maxRetries?: number;
};

export type BatchProcessor<T, R> = {
	add: (item: T) => Promise<R>;
	flush: () => Promise<void>;
	getStats: () => {
		pendingItems: number;
		processedItems: number;
		failedItems: number;
		activeBatches: number;
	};
	close: () => Promise<void>;
};
