import { err, ok } from "@w/workflow";
import type { Task } from "@wpackages/task";
import { describe, expect, spyOn, test } from "bun:test";
import { createQueue, enqueue, processNext } from ".";

// Mock delay function to speed up tests
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("@wpackages/queue", () => {
	const createTask = (id: string, name: string, executeFn: () => Promise<any>): Task<void, any, Error> => ({
		id,
		name,
		execute: executeFn,
	});

	test("should create a queue with default config", () => {
		const queue = createQueue("test-queue");
		expect(queue.name).toBe("test-queue");
		expect(queue.config.maxConcurrent).toBe(5);
		expect(queue.config.maxRetries).toBe(3);
		expect(queue.pending).toBeArrayOfSize(0);
	});

	test("should enqueue a task", () => {
		let queue = createQueue("test-queue");
		const task = createTask("task1", "Test Task", async () => ok("success"));
		const result = enqueue(queue, task);

		expect(result._tag).toBe("Success");
		if (result._tag === "Success") {
			queue = result.value;
		}

		expect(queue.pending).toBeArrayOfSize(1);
		expect(queue.pending[0].id).toBe("task1");
	});

	test("should process a successful task", async () => {
		let queue = createQueue("test-queue");
		const task = createTask("task1", "Successful Task", async () => {
			await mockDelay(10);
			return ok("great success");
		});
		const enqueued = enqueue(queue, task);
		if (enqueued._tag === "Success") {
			queue = enqueued.value;
		}

		const result = await processNext(queue);

		expect(result._tag).toBe("Success");
		if (result._tag === "Success") {
			const finalQueue = result.value;
			expect(finalQueue.pending).toBeArrayOfSize(0);
			expect(finalQueue.running).toBeArrayOfSize(0);
			expect(finalQueue.completed).toBeArrayOfSize(1);
			expect(finalQueue.failed).toBeArrayOfSize(0);
			expect(finalQueue.completed[0].taskId).toBe("task1");
			expect(finalQueue.completed[0].status).toBe("completed");
			expect(finalQueue.completed[0].result?.value).toBe("great success");
		}
	});

	test("should handle a failing task with retries", async () => {
		const executeFn = spyOn(console, "error"); // Suppress error logs in test output
		let queue = createQueue("test-queue", { maxRetries: 2, retryDelay: 5 });
		const task = createTask("task-fail", "Failing Task", async () => {
			return err(new Error("failure"));
		});

		const enqueued = enqueue(queue, task);
		if (enqueued._tag === "Success") {
			queue = enqueued.value;
		}

		const result = await processNext(queue);

		expect(result._tag).toBe("Success");
		if (result._tag === "Success") {
			const finalQueue = result.value;
			expect(finalQueue.completed).toBeArrayOfSize(0);
			expect(finalQueue.failed).toBeArrayOfSize(1);
			expect(finalQueue.failed[0].taskId).toBe("task-fail");
			expect(finalQueue.failed[0].status).toBe("failed");
			expect(finalQueue.failed[0].attempts).toBe(3); // 1 initial + 2 retries
			expect(finalQueue.failed[0].error?.message).toBe("failure");
		}
		executeFn.mockRestore();
	});

	test("should respect maxConcurrent limit", async () => {
		// Create a queue that can only run 1 task at a time
		let queue = createQueue("concurrent-test", { maxConcurrent: 1 });

		// Create a long-running task
		const longTask = createTask("long-task", "Long Task", () => mockDelay(100).then(() => ok("done")));
		const shortTask = createTask("short-task", "Short Task", () => ok("done quick"));

		// Enqueue both
		let enqueued = enqueue(queue, longTask);
		if (enqueued._tag === "Success") queue = enqueued.value;
		enqueued = enqueue(queue, shortTask);
		if (enqueued._tag === "Success") queue = enqueued.value;

		// Start processing the first (long) task, but don't wait for it to finish
		processNext(queue);

		// Manually update the queue state to reflect the task is running
		queue = {
			...queue,
			pending: [shortTask],
			running: [longTask],
		};

		// Now, try to process the next task. It should fail because the queue is full.
		const result = await processNext(queue);

		expect(result._tag).toBe("Failure");
		if (result._tag === "Failure") {
			expect(result.error.code).toBe("QUEUE_FULL");
		}
	});
});
