import { describe, expect, it } from "vitest";
import { createQueue, enqueue, getQueueStats, clearCompleted, clearFailed } from "../services/queue";
import { createTask } from "./creators";

describe("Queue Operations", () => {
	it("should create a queue with default config", () => {
		const queue = createQueue("test-queue");
		expect(queue.name).toBe("test-queue");
		expect(queue.config.maxConcurrent).toBe(5);
		expect(queue.config.maxRetries).toBe(3);
		expect(queue.config.retryDelay).toBe(1000);
		expect(queue.config.timeout).toBe(30000);
		expect(queue.config.priority).toBe(false);
	});

	it("should create a queue with custom config", () => {
		const queue = createQueue("test-queue", {
			maxConcurrent: 10,
			maxRetries: 5,
			retryDelay: 2000,
			timeout: 60000,
			priority: true,
		});
		expect(queue.config.maxConcurrent).toBe(10);
		expect(queue.config.maxRetries).toBe(5);
		expect(queue.config.retryDelay).toBe(2000);
		expect(queue.config.timeout).toBe(60000);
		expect(queue.config.priority).toBe(true);
	});

	it("should enqueue a task", () => {
		let queue = createQueue("test-queue");
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));

		const result = enqueue(queue, task);
		expect(result._tag).toBe("Success");
		expect(result.value.pending.length).toBe(1);
		expect(result.value.pending[0]?.name).toBe("test-task");
	});

	it("should get queue statistics", () => {
		let queue = createQueue("test-queue");
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));

		const enqueueResult = enqueue(queue, task);
		if (enqueueResult._tag === "Success") {
			queue = enqueueResult.value;
		}

		const stats = getQueueStats(queue);
		expect(stats.pending).toBe(1);
		expect(stats.running).toBe(0);
		expect(stats.completed).toBe(0);
		expect(stats.failed).toBe(0);
		expect(stats.total).toBe(1);
	});

	it("should clear completed tasks", () => {
		let queue = createQueue("test-queue");
		queue.completed.push({
			taskId: "task-1",
			status: "completed",
			startedAt: new Date(),
			completedAt: new Date(),
			duration: 1000,
			attempts: 1,
		});

		const clearedQueue = clearCompleted(queue);
		expect(clearedQueue.completed.length).toBe(0);
	});

	it("should clear failed tasks", () => {
		let queue = createQueue("test-queue");
		queue.failed.push({
			taskId: "task-1",
			status: "failed",
			startedAt: new Date(),
			completedAt: new Date(),
			duration: 1000,
			attempts: 1,
			error: new Error("Task failed"),
		});

		const clearedQueue = clearFailed(queue);
		expect(clearedQueue.failed.length).toBe(0);
	});
});
