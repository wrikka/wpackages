import { describe, expect, it, vi } from "vitest";
import { BulkheadRejectionError } from "../errors";
import { createBulkhead, createBulkheadConfig, defaultBulkheadConfig } from "./bulkhead";

describe("bulkhead service", () => {
	describe("createBulkhead", () => {
		it("should start with initial state", () => {
			const bulkhead = createBulkhead({ maxConcurrent: 5 });
			const state = bulkhead.getState();

			expect(state.running).toBe(0);
			expect(state.queued).toBe(0);
		});

		it("should execute function successfully", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 5 });
			const fn = vi.fn().mockResolvedValue("success");

			const result = await bulkhead.execute(fn);

			expect(result).toBe("success");
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it("should respect max concurrent limit", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 2 });
			let maxConcurrent = 0;
			let currentConcurrent = 0;

			const fn = vi.fn(async () => {
				currentConcurrent++;
				maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
				await new Promise((resolve) => setTimeout(resolve, 50));
				currentConcurrent--;
				return "done";
			});

			// Execute 5 functions
			await Promise.all([
				bulkhead.execute(fn),
				bulkhead.execute(fn),
				bulkhead.execute(fn),
				bulkhead.execute(fn),
				bulkhead.execute(fn),
			]);

			expect(maxConcurrent).toBeLessThanOrEqual(2);
		});

		it("should queue requests when at capacity", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 1, maxQueue: 10 });
			let executedCount = 0;

			const fn = vi.fn(async () => {
				executedCount++;
				await new Promise((resolve) => setTimeout(resolve, 50));
				return "done";
			});

			const promises = Array(5)
				.fill(null)
				.map(() => bulkhead.execute(fn));

			await Promise.all(promises);

			expect(executedCount).toBe(5);
		});

		it("should reject when queue is full", async () => {
			const bulkhead = createBulkhead({
				maxConcurrent: 1,
				maxQueue: 1,
			});

			const fn = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return "done";
			});

			const promise1 = bulkhead.execute(fn);
			const promise2 = bulkhead.execute(fn);
			const promise3 = bulkhead.execute(fn).catch((e) => e);

			const result3 = await promise3;

			expect(result3).toBeInstanceOf(BulkheadRejectionError);
			expect(result3.message).toContain("Queue is full");

			await Promise.all([promise1, promise2]);
		});

		it("should call onAcquire callback", async () => {
			const onAcquire = vi.fn();
			const bulkhead = createBulkhead({
				maxConcurrent: 2,
				onAcquire,
			});

			const fn = vi.fn().mockResolvedValue("done");

			await bulkhead.execute(fn);
			await bulkhead.execute(fn);

			expect(onAcquire).toHaveBeenCalledTimes(2);
		});

		it("should call onRelease callback", async () => {
			const onRelease = vi.fn();
			const bulkhead = createBulkhead({
				maxConcurrent: 2,
				onRelease,
			});

			const fn = vi.fn().mockResolvedValue("done");

			await bulkhead.execute(fn);
			await bulkhead.execute(fn);

			expect(onRelease).toHaveBeenCalled();
		});

		it("should call onRejection callback", async () => {
			const onRejection = vi.fn();
			const bulkhead = createBulkhead({
				maxConcurrent: 1,
				maxQueue: 0,
				onRejection,
			});

			const fn = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return "done";
			});

			const promise1 = bulkhead.execute(fn);
			const promise2 = bulkhead.execute(fn).catch(() => {});

			await Promise.all([promise1, promise2]);

			expect(onRejection).toHaveBeenCalled();
		});

		it("should track statistics", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 2 });
			const fn = vi.fn().mockResolvedValue("done");

			await bulkhead.execute(fn);
			await bulkhead.execute(fn);
			await bulkhead.execute(fn);

			const stats = bulkhead.getStats();

			expect(stats.completed).toBe(3);
			expect(stats.capacity).toBe(2);
		});

		it("should support queue timeout", async () => {
			const bulkhead = createBulkhead({
				maxConcurrent: 1,
				maxQueue: 10,
				queueTimeout: 100,
			});

			const fn = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 200));
				return "done";
			});

			const promise1 = bulkhead.execute(fn);
			const promise2 = bulkhead.execute(fn).catch((e) => e);

			const result2 = await promise2;

			expect(result2).toBeInstanceOf(BulkheadRejectionError);
			expect(result2.message).toContain("timed out");

			await promise1;
		});

		it("should support reset", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 2 });

			bulkhead.reset();

			const state = bulkhead.getState();
			const stats = bulkhead.getStats();

			expect(state.running).toBe(0);
			expect(state.queued).toBe(0);
			expect(stats.completed).toBe(0);
			expect(stats.rejected).toBe(0);
		});

		it("should handle errors in executed function", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 2 });
			const error = new Error("Execution error");
			const fn = vi.fn().mockRejectedValue(error);

			await expect(bulkhead.execute(fn)).rejects.toThrow("Execution error");
		});

		it("should process queued items in order", async () => {
			const bulkhead = createBulkhead({ maxConcurrent: 1 });
			const results: number[] = [];

			const fn = (value: number) => async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				results.push(value);
				return value;
			};

			await Promise.all([
				bulkhead.execute(fn(1)),
				bulkhead.execute(fn(2)),
				bulkhead.execute(fn(3)),
			]);

			expect(results).toEqual([1, 2, 3]);
		});
	});

	describe("createBulkheadConfig", () => {
		it("should create config with defaults", () => {
			const config = createBulkheadConfig({});

			expect(config.maxConcurrent).toBe(10);
		});

		it("should merge user config with defaults", () => {
			const config = createBulkheadConfig({
				maxConcurrent: 20,
				maxQueue: 100,
			});

			expect(config.maxConcurrent).toBe(20);
		});

		it("should include optional callbacks", () => {
			const onAcquire = vi.fn();
			const onRelease = vi.fn();
			const onRejection = vi.fn();

			const config = createBulkheadConfig({
				onAcquire,
				onRelease,
				onRejection,
			});

			expect(config.onAcquire).toBe(onAcquire);
			expect(config.onRelease).toBe(onRelease);
			expect(config.onRejection).toBe(onRejection);
		});
	});

	describe("defaultBulkheadConfig", () => {
		it("should have sensible defaults", () => {
			expect(defaultBulkheadConfig.maxConcurrent).toBe(10);
		});
	});
});
