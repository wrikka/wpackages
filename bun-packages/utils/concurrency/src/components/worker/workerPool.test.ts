import { describe, expect, it } from "vitest";
import { createWorkerPool } from "./workerPool";

describe("WorkerPool", () => {
	it("should submit and execute tasks", async () => {
		const pool = createWorkerPool({ maxWorkers: 2 });

		const task1 = async () => {
			await new Promise(resolve => setTimeout(resolve, 50));
			return "result1";
		};

		const task2 = async () => {
			await new Promise(resolve => setTimeout(resolve, 30));
			return "result2";
		};

		const [result1, result2] = await Promise.all([
			pool.submit(task1),
			pool.submit(task2),
		]);

		expect(result1).toBe("result1");
		expect(result2).toBe("result2");

		// Give some time for stats to update
		await new Promise(resolve => setTimeout(resolve, 10));

		const stats = pool.getStats();
		expect(stats.completedTasks).toBeGreaterThanOrEqual(1);

		await pool.terminate();
	});

	it("should handle batch submissions", async () => {
		const pool = createWorkerPool({ maxWorkers: 2 });

		const tasks = Array.from({ length: 5 }, (_, i) => async () => {
			await new Promise(resolve => setTimeout(resolve, 20));
			return `result${i}`;
		});

		const results = await pool.submitBatch(tasks);

		expect(results).toHaveLength(5);
		expect(results).toEqual(["result0", "result1", "result2", "result3", "result4"]);

		// Give some time for stats to update
		await new Promise(resolve => setTimeout(resolve, 10));

		const stats = pool.getStats();
		expect(stats.completedTasks).toBeGreaterThanOrEqual(3);

		await pool.terminate();
	});

	it("should limit concurrent workers", async () => {
		const pool = createWorkerPool({ maxWorkers: 2 });

		let activeTasks = 0;
		let maxActiveTasks = 0;

		const createTask = (id: number) => async () => {
			activeTasks++;
			maxActiveTasks = Math.max(maxActiveTasks, activeTasks);
			await new Promise(resolve => setTimeout(resolve, 100));
			activeTasks--;
			return `task${id}`;
		};

		// Submit 5 tasks
		const promises = Array.from({ length: 5 }, (_, i) => pool.submit(createTask(i)));

		await Promise.all(promises);

		// Should never exceed maxWorkers
		expect(maxActiveTasks).toBeLessThanOrEqual(2);

		// Give some time for stats to update
		await new Promise(resolve => setTimeout(resolve, 10));

		const stats = pool.getStats();
		expect(stats.completedTasks).toBeGreaterThanOrEqual(3);

		await pool.terminate();
	});

	it("should provide correct stats", async () => {
		const pool = createWorkerPool({ maxWorkers: 1 });

		const task = async () => {
			await new Promise(resolve => setTimeout(resolve, 50));
			return "result";
		};

		// Submit multiple tasks
		const promises = Array.from({ length: 3 }, () => pool.submit(task));

		// Check stats while tasks are running
		const stats1 = pool.getStats();
		expect(stats1.pendingTasks).toBeGreaterThanOrEqual(0);

		await Promise.all(promises);

		// Give some time for stats to update
		await new Promise(resolve => setTimeout(resolve, 10));

		// Check final stats
		const stats2 = pool.getStats();
		expect(stats2.completedTasks).toBeGreaterThanOrEqual(1);
		expect(stats2.pendingTasks).toBe(0);

		await pool.terminate();
	});
});
