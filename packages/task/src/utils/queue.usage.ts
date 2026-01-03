/**
 * ตัวอย่างการใช้งาน createQueue
 *
 * Run: bun run packages/task/src/utils/queue.usage.ts
 */

import { clearCompleted, createQueue, enqueue, getQueueStats, processNext } from "../services/queue";
import type { Task } from "../types";
import { createTask } from "./creators";
import { isOk, unwrap } from "./result";

// Helper to create a simple task that resolves after a delay
const createSampleTask = (
	name: string,
	delay: number,
	shouldFail = false,
	priority: Task<any, any, any>["priority"] = "normal",
) => {
	return createTask(name, async (input: { data: string }) => {
		await new Promise(resolve => setTimeout(resolve, delay));
		if (shouldFail) {
			return { _tag: "Failure", error: new Error(`Task ${name} failed intentionally`) };
		}
		return { _tag: "Success", value: `Task ${name} completed with input: ${input.data}` };
	}, { priority });
};

async function main() {
	console.log("--- Initializing Task Queue ---");

	// 1. Create a new task queue with priority enabled
	let myQueue = createQueue("MyTestQueue", {
		maxConcurrent: 2,
		priority: true,
	});

	// 2. Create some sample tasks
	const task1 = createSampleTask("Task 1 (low priority)", 500, false, "low");
	const task2 = createSampleTask("Task 2 (high priority)", 300, false, "high");
	const task3 = createSampleTask("Task 3 (normal)", 400);
	const task4 = createSampleTask("Task 4 (will fail)", 200, true, "critical");
	const task5 = createSampleTask("Task 5 (long)", 800);

	// 3. Enqueue tasks
	myQueue = unwrap(enqueue(myQueue, task1));
	myQueue = unwrap(enqueue(myQueue, task2));
	myQueue = unwrap(enqueue(myQueue, task3));
	myQueue = unwrap(enqueue(myQueue, task4));
	myQueue = unwrap(enqueue(myQueue, task5));

	console.log("Tasks enqueued. Initial queue state:");
	console.log("Pending tasks:", myQueue.pending.map(t => t.name));
	console.log("Stats:", getQueueStats(myQueue));

	console.log("\n--- Processing Queue ---");

	// 4. Process all tasks in the queue
	while (myQueue.pending.length > 0) {
		const result = await processNext(myQueue);
		if (isOk(result)) {
			myQueue = result.value;
			console.log(`\nProcessed a task. Current stats:`);
			console.log(getQueueStats(myQueue));
		} else {
			console.error("Queue processing error:", result.error.message);
			break;
		}
	}

	console.log("\n--- Queue Processing Finished ---");

	// 5. Display final results
	console.log("\nCompleted Tasks:");
	myQueue.completed.forEach(res => {
		if (res.result && res.result._tag === "Success") {
			const taskName = String(res.result.value).split(" ")[1] ?? "Unknown";
			console.log(`- ${res.taskId} (${taskName}): Success`);
		}
	});

	console.log("\nFailed Tasks:");
	myQueue.failed.forEach(res => {
		if (res.error instanceof Error) {
			const taskName = res.error.message.split(" ")[1] ?? "Unknown";
			console.log(`- ${res.taskId} (${taskName}): Failed after ${res.attempts} attempt(s)`);
		}
	});

	console.log("\nFinal Stats:", getQueueStats(myQueue));

	// 6. Clear completed tasks
	myQueue = clearCompleted(myQueue);
	console.log("\nStats after clearing completed:", getQueueStats(myQueue));
}

main();
