import { createSemaphore } from "./semaphore";

// Example 1: Limiting concurrent API requests
async function example1() {
	console.log("=== Semaphore Example 1: Limiting Concurrent API Requests ===");

	const apiSemaphore = createSemaphore(3); // Allow max 3 concurrent requests

	const makeApiRequest = async (id: number): Promise<string> => {
		console.log(`Request ${id}: Starting`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
		console.log(`Request ${id}: Completed`);
		return `Response ${id}`;
	};

	// Create 10 requests, but only 3 will run concurrently
	const requests = Array.from({ length: 10 }, (_, i) => apiSemaphore.runExclusive(() => makeApiRequest(i + 1)));

	const results = await Promise.all(requests);
	console.log("All requests completed:", results);
}

// Example 2: Resource pool management
async function example2() {
	console.log("\n=== Semaphore Example 2: Resource Pool Management ===");

	// Simulate a database connection pool with 2 connections
	const dbSemaphore = createSemaphore(2);

	const useDatabaseConnection = async (query: string): Promise<string> => {
		console.log(`Executing query: ${query}`);
		await new Promise(resolve => setTimeout(resolve, 500)); // Simulate DB work
		return `Result for ${query}`;
	};

	// Multiple database operations
	const operations = [
		dbSemaphore.runExclusive(() => useDatabaseConnection("SELECT * FROM users")),
		dbSemaphore.runExclusive(() => useDatabaseConnection("UPDATE users SET name='John'")),
		dbSemaphore.runExclusive(() => useDatabaseConnection("DELETE FROM logs")),
		dbSemaphore.runExclusive(() => useDatabaseConnection("INSERT INTO logs VALUES (...)")),
	];

	const results = await Promise.all(operations);
	console.log("Database operations completed:", results);
}

// Example 3: File processing with limited concurrency
async function example3() {
	console.log("\n=== Semaphore Example 3: File Processing with Limited Concurrency ===");

	const fileSemaphore = createSemaphore(2); // Process max 2 files at once

	const processFile = async (filename: string): Promise<string> => {
		console.log(`Processing file: ${filename}`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
		console.log(`Finished processing: ${filename}`);
		return `Processed ${filename}`;
	};

	const files = ["file1.txt", "file2.txt", "file3.txt", "file4.txt", "file5.txt"];

	// Process files with limited concurrency
	const results = await Promise.all(
		files.map(file => fileSemaphore.runExclusive(() => processFile(file))),
	);

	console.log("All files processed:", results);
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
}

runExamples().catch(console.error);
