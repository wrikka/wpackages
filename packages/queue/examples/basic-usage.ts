import type { Task } from "@wpackages/task";
import { Console, Effect } from "effect";
import { createQueueManager, processNext } from "../src";

// 1. Define a task
const myTask: Task<void, string, Error> = {
	id: "task-1",
	name: "My First Task",
	execute: () =>
		Effect.succeed("Hello from the queue!").pipe(
			Effect.delay("1 seconds"),
			Effect.tap((msg) => Console.log(msg)),
		),
};

// 2. Create a program to run the queue
const program = Effect.gen(function*() {
	// Create a manager for a queue named 'my-queue'
	const manager = yield* createQueueManager("my-queue");

	// Enqueue the task
	yield* manager.enqueue(myTask);
	yield* Console.log("Task enqueued. Processing next...");

	// Process the task
	// In a real app, you might call this in a loop or based on events
	yield* processNext(manager);

	// Get final stats
	const stats = yield* manager.getStats;
	yield* Console.log("Queue stats:", stats);
});

// 3. Run the program
Effect.runPromise(program).catch(console.error);
