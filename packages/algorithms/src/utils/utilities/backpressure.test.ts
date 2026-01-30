import { describe, expect, it, vi } from "vitest";
import { BackpressureController, processWithBackpressure } from "./backpressure";

describe("backpressure", () => {
	describe("BackpressureController", () => {
		it("should process items normally", async () => {
			const controller = new BackpressureController({ highWaterMark: 3, lowWaterMark: 1 });
			const processor = vi.fn().mockResolvedValue(undefined);

			await controller.process(1, processor);
			await controller.process(2, processor);

			expect(processor).toHaveBeenCalledTimes(2);
			expect(controller.isPaused).toBe(false);
		});

		it("should pause when high water mark is reached", async () => {
			const controller = new BackpressureController({ highWaterMark: 2, lowWaterMark: 1 });
			const processor = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)));

			const promises = [controller.process(1, processor), controller.process(2, processor), controller.process(3, processor)];
			await Promise.all(promises);

			expect(controller.isPaused).toBe(false);
		});

		it("should resume when low water mark is reached", async () => {
			const controller = new BackpressureController({ highWaterMark: 3, lowWaterMark: 1 });
			let processingCount = 0;

			const processor = vi.fn().mockImplementation(async () => {
				processingCount++;
				await new Promise((resolve) => setTimeout(resolve, 10));
			});

			const promises = Array.from({ length: 5 }, (_, i) => controller.process(i, processor));
			await Promise.all(promises);

			expect(processingCount).toBe(5);
		});

		it("should reset state", async () => {
			const controller = new BackpressureController({ highWaterMark: 2, lowWaterMark: 1 });
			const processor = vi.fn().mockResolvedValue(undefined);

			await controller.process(1, processor);
			controller.reset();

			expect(controller.size).toBe(0);
			expect(controller.isPaused).toBe(false);
		});
	});

	describe("processWithBackpressure", () => {
		it("should process all items", async () => {
			const processor = vi.fn().mockResolvedValue(undefined);
			const items = [1, 2, 3, 4, 5];

			await processWithBackpressure(items, processor, { highWaterMark: 2, lowWaterMark: 1 });

			expect(processor).toHaveBeenCalledTimes(5);
		});

		it("should handle empty items", async () => {
			const processor = vi.fn();
			await processWithBackpressure([], processor);
			expect(processor).not.toHaveBeenCalled();
		});
	});
});
