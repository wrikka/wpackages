/**
 * Batch processing utilities
 */

import type { Queue, BatchConfig, BatchResult, BatchMetadata } from '../types';

export const takeBatch = <A>(queue: Queue<A>, config: BatchConfig): Promise<BatchResult<A>> => {
	return (async () => {
		const startTime = Date.now();
		const items: A[] = [];
		const q = queue as unknown as { dequeue(): Promise<A | undefined> };
		while (items.length < config.batchSize && Date.now() - startTime < config.maxWaitMs) {
			if (queue.size > 0) {
				const item = await q.dequeue();
				if (item) items.push(item);
			} else {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
		}
		const metadata: BatchMetadata = {
			batchId: crypto.randomUUID(),
			createdAt: Date.now(),
			itemCount: items.length,
			sourceQueue: "batch",
		};
		return { items, metadata };
	})();
};
