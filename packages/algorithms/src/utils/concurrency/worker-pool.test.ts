import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { WorkerPool } from "./worker-pool";

describe.skip("worker-pool", () => {
	let pool: WorkerPool<number, number> | undefined;

	beforeEach(() => {
		const workerScript = new URL("./worker-pool.worker.ts", import.meta.url);
		pool = new WorkerPool(workerScript, { maxWorkers: 2 });
	});

	afterEach(() => {
		if (pool) {
			pool.terminate();
		}
	});

	it("should execute a single task", async () => {
		const result = await pool!.execute(5);
		expect(result).toBe(10);
	});

	it("should execute multiple tasks", async () => {
		const results = await pool!.executeAll([1, 2, 3, 4, 5]);
		expect(results).toEqual([2, 4, 6, 8, 10]);
	});

	it("should handle task queue", async () => {
		const promises = Array.from({ length: 10 }, (_, i) => pool!.execute(i));
		const results = await Promise.all(promises);
		expect(results).toEqual(Array.from({ length: 10 }, (_, i) => i * 2));
	});

	it("should respect maxWorkers limit", async () => {
		const startTime = Date.now();
		await pool!.executeAll([1, 2, 3, 4]);
		const duration = Date.now() - startTime;
		expect(duration).toBeGreaterThan(100);
	});
});
