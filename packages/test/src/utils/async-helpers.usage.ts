/**
 * Usage examples for async helpers
 */

import { batch, delay, retry, sequential, waitFor, withTimeout } from "./async-helpers";

// Example 1: Delay execution
export const example1_delay = async () => {
	console.log("Starting...");
	await delay(1000);
	console.log("After 1 second");
};

// Example 2: Wait for condition
export const example2_waitFor = async () => {
	let dataLoaded = false;

	// Simulate data loading
	setTimeout(() => {
		dataLoaded = true;
	}, 500);

	await waitFor(() => dataLoaded, 2000);
	console.log("Data is loaded!");
};

// Example 3: Retry with exponential backoff
export const example3_retry = async () => {
	let attempts = 0;

	const result = await retry(
		async () => {
			attempts++;
			console.log(`Attempt ${attempts}`);
			if (attempts < 3) {
				throw new Error("Not ready yet");
			}
			return "Success!";
		},
		5,
		100,
	);

	console.log("Result:", result);
};

// Example 4: Timeout protection
export const example4_withTimeout = async () => {
	try {
		const result = await withTimeout(
			new Promise((resolve) => {
				setTimeout(() => resolve("Done"), 2000);
			}),
			1000,
		);
		console.log("Result:", result);
	} catch (err) {
		console.log("Operation timed out:", (err as Error).message);
	}
};

// Example 5: Batch processing
export const example5_batch = async () => {
	const items = Array.from({ length: 20 }, (_, i) => i + 1);

	await batch(items, async (item) => {
		console.log(`Processing item ${item}`);
		await delay(100);
	}, 5);

	console.log("All items processed in batches of 5");
};

// Example 6: Sequential processing
export const example6_sequential = async () => {
	const items = ["apple", "banana", "cherry"];

	const results = await sequential(items, async (item) => {
		await delay(100);
		return item.toUpperCase();
	});

	console.log("Results:", results); // ["APPLE", "BANANA", "CHERRY"]
};

// Example 7: Real-world scenario - API polling
export const example7_apiPolling = async () => {
	let status = "pending";

	// Simulate status check
	setTimeout(() => {
		status = "completed";
	}, 500);

	await waitFor(() => status === "completed", 5000);

	console.log("Task completed!");
};

// Example 8: Retry with custom logic
export const example8_retryCustom = async () => {
	const fetchData = async () => {
		const random = Math.random();
		if (random < 0.7) {
			throw new Error("Network error");
		}
		return { data: "success" };
	};

	const result = await retry(fetchData, 5, 500);
	console.log("Data fetched:", result);
};

// Example 9: Parallel operations with timeout
export const example9_parallelWithTimeout = async () => {
	const operations = [
		delay(500).then(() => "Operation 1"),
		delay(300).then(() => "Operation 2"),
		delay(200).then(() => "Operation 3"),
	];

	try {
		const results = await withTimeout(
			Promise.all(operations),
			1000,
		);
		console.log("All operations completed:", results);
	} catch (err) {
		console.log("Operations timed out:", (err as Error).message);
	}
};

// Example 10: Complex async flow
export const example10_complexFlow = async () => {
	console.log("Starting complex async flow...");

	// Step 1: Wait for initialization
	await delay(500);
	console.log("Initialization complete");

	// Step 2: Retry data fetch
	const data = await retry(
		async () => {
			console.log("Fetching data...");
			await delay(100);
			return { id: 1, name: "Test" };
		},
		3,
		200,
	);
	console.log("Data fetched:", data);

	// Step 3: Process items in batches
	const items = Array.from({ length: 10 }, (_, i) => i + 1);
	await batch(
		items,
		async (item) => {
			console.log(`Processing item ${item}`);
			await delay(50);
		},
		3,
	);

	console.log("Complex flow completed!");
};
