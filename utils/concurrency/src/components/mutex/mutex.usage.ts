import { sleep } from "../async/sleep";
import { createMutex } from "./index";

/**
 * @fileoverview
 * This file demonstrates the usage of the Mutex class to protect a critical section
 * of code from concurrent access, preventing race conditions.
 */

// A shared resource that needs protection
let sharedCounter = 0;

// A new Mutex instance to protect the sharedCounter
const mutex = createMutex();

/**
 * An asynchronous function that simulates a task which reads and writes to the shared counter.
 * It uses the mutex to ensure that the read and write operations are atomic.
 * @param {number} id - A unique identifier for the task.
 */
async function criticalTask(id: number) {
	console.log(`Task ${id}: Attempting to acquire lock...`);

	// Use runExclusive to safely access the shared resource
	await mutex.runExclusive(async () => {
		console.log(`Task ${id}: Lock acquired. Accessing critical section.`);

		// Simulate some work inside the critical section
		const currentValue = sharedCounter;
		await sleep(Math.random() * 100); // Simulate I/O or other async operation
		sharedCounter = currentValue + 1;

		console.log(
			`Task ${id}: Incremented counter to ${sharedCounter}. Releasing lock.`,
		);
	});

	console.log(`Task ${id}: Lock released.`);
}

/**
 * Main function to demonstrate the mutex in action.
 * It starts multiple tasks concurrently that all try to modify the same shared resource.
 */
async function main() {
	console.log("--- Mutex Usage Example ---");
	console.log(`Initial counter value: ${sharedCounter}`);

	// Create an array of tasks to run concurrently
	const tasks = [
		criticalTask(1),
		criticalTask(2),
		criticalTask(3),
		criticalTask(4),
		criticalTask(5),
	];

	// Wait for all tasks to complete
	await Promise.all(tasks);

	console.log(`\nFinal counter value: ${sharedCounter}`);
	console.log(
		"Without a mutex, the final value would likely be less than 5 due to race conditions.",
	);
	console.log("--- End of Example ---");
}

// Run the demonstration
main();
