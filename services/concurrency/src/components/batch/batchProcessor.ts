import type { BatchProcessor, BatchProcessorOptions } from "./types";

export const createBatchProcessor = <T, R>(
	processor: (items: T[]) => Promise<R[]>,
	_options: BatchProcessorOptions = {},
): BatchProcessor<T, R> => {
	const {
		batchSize = 10,
		flushInterval = 1000,
		concurrency = 1,
		maxRetries = 3,
	} = _options;

	let pendingItems: Array<{ item: T; resolve: (value: R) => void; reject: (error: unknown) => void }> = [];
	let processedItems = 0;
	let failedItems = 0;
	let activeBatches = 0;
	let closed = false;

	const flushTimer = setInterval(() => {
		if (pendingItems.length > 0) {
			flush();
		}
	}, flushInterval);

	const processBatch = async (
		items: Array<{ item: T; resolve: (value: R) => void; reject: (error: unknown) => void }>,
	) => {
		activeBatches++;

		try {
			const itemValues = items.map(({ item }) => item);
			let results: R[] | null = null;
			let lastError: unknown = null;

			// Retry logic
			for (let attempt = 0; attempt < maxRetries; attempt++) {
				try {
					results = await processor(itemValues);
					break;
				} catch (_error) {
					lastError = _error;
					if (attempt < maxRetries - 1) {
						// Wait before retry
						await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
					}
				}
			}

			if (results && results.length === items.length) {
				// Resolve all promises with their corresponding results
				items.forEach((item, index) => {
					const result = results[index];
					if (result !== undefined) {
						item.resolve(result);
					}
				});
				processedItems += items.length;
			} else {
				// Reject all promises if processing failed
				const error = lastError || new Error("Batch processing failed");
				items.forEach(item => {
					item.reject(error);
				});
				failedItems += items.length;
			}
		} catch (_error) {
			// Reject all promises if processing failed
			const error = _error instanceof Error ? _error : new Error(String(_error));
			items.forEach(item => {
				item.reject(error);
			});
			failedItems += items.length;
		} finally {
			activeBatches--;
		}
	};

	const flush = async (): Promise<void> => {
		if (pendingItems.length === 0) {
			return;
		}

		// Process items in batches
		const itemsToProcess = [...pendingItems];
		pendingItems = [];

		const batches = [];
		for (let i = 0; i < itemsToProcess.length; i += batchSize) {
			batches.push(itemsToProcess.slice(i, i + batchSize));
		}

		// Process batches with concurrency limit
		const batchPromises: Array<Promise<void>> = [];

		for (let i = 0; i < batches.length; i += concurrency) {
			const currentBatches = batches.slice(i, i + concurrency);
			const currentPromises = currentBatches.map(batch => processBatch(batch));
			batchPromises.push(...currentPromises);

			// Wait for current batch to complete before starting next
			if (concurrency === 1 || i + concurrency < batches.length) {
				await Promise.all(currentPromises);
			}
		}

		await Promise.all(batchPromises);
	};

	const add = (item: T): Promise<R> => {
		if (closed) {
			return Promise.reject(new Error("Batch processor is closed"));
		}

		return new Promise<R>((resolve, reject) => {
			pendingItems.push({ item, resolve, reject });

			// Flush immediately if we've reached batch size
			if (pendingItems.length >= batchSize) {
				flush();
			}
		});
	};

	const getStats = () => ({
		pendingItems: pendingItems.length,
		processedItems,
		failedItems,
		activeBatches,
	});

	const close = async (): Promise<void> => {
		if (closed) {
			return;
		}

		closed = true;
		clearInterval(flushTimer);

		// Process remaining items
		if (pendingItems.length > 0) {
			await flush();
		}

		// Wait for all active batches to complete
		while (activeBatches > 0) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	};

	return {
		add,
		flush,
		getStats,
		close,
	};
};
