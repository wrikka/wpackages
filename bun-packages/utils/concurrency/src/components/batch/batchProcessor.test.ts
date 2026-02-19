import { describe, expect, it, vi } from "vitest";
import { createBatchProcessor } from "./batchProcessor";

describe("BatchProcessor", () => {
	it("should process items in batches", async () => {
		const processor = vi.fn(async (items: number[]) => {
			return items.map(item => `processed-${item}`);
		});

		const batchProcessor = createBatchProcessor(processor, { batchSize: 3 });

		// Add items
		const promises = [
			batchProcessor.add(1),
			batchProcessor.add(2),
			batchProcessor.add(3),
			batchProcessor.add(4),
			batchProcessor.add(5),
		];

		const results = await Promise.all(promises);

		expect(results).toEqual([
			"processed-1",
			"processed-2",
			"processed-3",
			"processed-4",
			"processed-5",
		]);

		// Should have been called with two batches
		expect(processor).toHaveBeenCalledTimes(2);
		expect(processor).toHaveBeenCalledWith([1, 2, 3]);
		expect(processor).toHaveBeenCalledWith([4, 5]);

		const stats = batchProcessor.getStats();
		expect(stats.processedItems).toBe(5);
		expect(stats.pendingItems).toBe(0);

		await batchProcessor.close();
	});

	it("should handle processor errors", async () => {
		const processor = vi.fn(async () => {
			throw new Error("Processing failed");
		});

		const batchProcessor = createBatchProcessor(processor, { batchSize: 2, maxRetries: 1 });

		await expect(batchProcessor.add(1)).rejects.toThrow("Processing failed");
		await expect(batchProcessor.add(2)).rejects.toThrow("Processing failed");

		const stats = batchProcessor.getStats();
		expect(stats.failedItems).toBe(2);

		await batchProcessor.close();
	});

	it("should flush on interval", async () => {
		const processor = vi.fn(async (items: number[]) => {
			return items.map(item => `processed-${item}`);
		});

		const batchProcessor = createBatchProcessor(processor, {
			batchSize: 10, // Large batch size
			flushInterval: 100, // Short interval
		});

		// Add fewer items than batch size
		const promises = [
			batchProcessor.add(1),
			batchProcessor.add(2),
		];

		// Wait for flush interval
		await new Promise(resolve => setTimeout(resolve, 150));

		const results = await Promise.all(promises);
		expect(results).toEqual(["processed-1", "processed-2"]);

		// Should have been called once despite not reaching batch size
		expect(processor).toHaveBeenCalledTimes(1);
		expect(processor).toHaveBeenCalledWith([1, 2]);

		await batchProcessor.close();
	});

	it("should retry on failures", async () => {
		let attempts = 0;
		const processor = vi.fn(async (items: number[]) => {
			attempts++;
			if (attempts < 3) {
				throw new Error(`Attempt ${attempts} failed`);
			}
			return items.map(item => `processed-${item}`);
		});

		const batchProcessor = createBatchProcessor(processor, {
			batchSize: 2,
			maxRetries: 3,
		});

		const result = await batchProcessor.add(1);
		expect(result).toBe("processed-1");
		expect(processor).toHaveBeenCalledTimes(3);

		await batchProcessor.close();
	});

	it("should handle concurrent batches", async () => {
		const processor = vi.fn(async (items: number[]) => {
			// Simulate processing time
			await new Promise(resolve => setTimeout(resolve, 50));
			return items.map(item => `processed-${item}`);
		});

		const batchProcessor = createBatchProcessor(processor, {
			batchSize: 2,
			concurrency: 2,
		});

		// Add enough items for multiple concurrent batches
		const promises = Array.from({ length: 6 }, (_, i) => batchProcessor.add(i + 1));

		const results = await Promise.all(promises);
		expect(results).toEqual([
			"processed-1",
			"processed-2",
			"processed-3",
			"processed-4",
			"processed-5",
			"processed-6",
		]);

		// Should have processed 3 batches concurrently
		expect(processor).toHaveBeenCalledTimes(3);

		await batchProcessor.close();
	});

	it("should prevent adding items after close", async () => {
		const processor = vi.fn(async (items: number[]) => {
			return items.map(item => `processed-${item}`);
		});

		const batchProcessor = createBatchProcessor(processor);
		await batchProcessor.close();

		await expect(batchProcessor.add(1)).rejects.toThrow("Batch processor is closed");
	});
});
