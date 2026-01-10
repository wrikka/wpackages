import { createBatchProcessor } from "./batchProcessor";

// Example 1: Database batch inserts
async function example1() {
	console.log("=== Batch Processor Example 1: Database Inserts ===");

	// Simulate database insert operation
	const batchInsert = async (users: Array<{ id: number; name: string; email: string }>): Promise<boolean[]> => {
		console.log(`Inserting batch of ${users.length} users into database...`);
		await new Promise(resolve => setTimeout(resolve, 200)); // Simulate DB operation
		console.log(`Batch insert completed for users:`, users.map(u => u.id));
		return users.map(() => true); // All successful
	};

	// Create batch processor
	const userProcessor = createBatchProcessor(batchInsert, {
		batchSize: 5,
		flushInterval: 2000,
		maxRetries: 3,
	});

	// Add users to be inserted
	const users = Array.from({ length: 12 }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		email: `user${i + 1}@example.com`,
	}));

	const insertPromises = users.map(user => userProcessor.add(user));

	// Wait for all inserts to complete
	const results = await Promise.all(insertPromises);
	console.log(`All ${results.length} users inserted successfully`);

	// Check stats
	const stats = userProcessor.getStats();
	console.log("Processor stats:", stats);

	// Close processor
	await userProcessor.close();
}

// Example 2: API batch requests
async function example2() {
	console.log("\n=== Batch Processor Example 2: API Requests ===");

	// Simulate API batch request operation
	const batchApiRequest = async (requests: Array<{ endpoint: string; data: any }>): Promise<any[]> => {
		console.log(`Making batch API request for ${requests.length} endpoints...`);
		await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network

		// Simulate some failures
		if (Math.random() < 0.2) {
			throw new Error("API temporarily unavailable");
		}

		console.log(`Batch API request completed`);
		return requests.map(req => ({
			endpoint: req.endpoint,
			status: "success",
			data: `Response for ${req.endpoint}`,
		}));
	};

	// Create batch processor with retry capability
	const apiProcessor = createBatchProcessor(batchApiRequest, {
		batchSize: 3,
		flushInterval: 1000,
		maxRetries: 2,
		concurrency: 2,
	});

	// Make various API requests
	const apiRequests = [
		{ endpoint: "/users", data: { action: "list" } },
		{ endpoint: "/products", data: { action: "list" } },
		{ endpoint: "/orders", data: { action: "create", order: { id: 1 } } },
		{ endpoint: "/analytics", data: { action: "report" } },
		{ endpoint: "/notifications", data: { action: "send", to: "user1" } },
		{ endpoint: "/settings", data: { action: "get" } },
		{ endpoint: "/profile", data: { action: "update", user: "user1" } },
	];

	const requestPromises = apiRequests.map(req => apiProcessor.add(req));

	try {
		const results = await Promise.all(requestPromises);
		console.log("API request results:", results);
	} catch (error) {
		console.log("Some API requests failed:", error instanceof Error ? error.message : String(error));
	}

	// Check stats
	const stats = apiProcessor.getStats();
	console.log("Processor stats:", stats);

	// Close processor
	await apiProcessor.close();
}

// Example 3: File processing batches
async function example3() {
	console.log("\n=== Batch Processor Example 3: File Processing ===");

	// Simulate file processing operation
	const batchProcessFiles = async (files: string[]): Promise<{ file: string; result: string }[]> => {
		console.log(`Processing batch of ${files.length} files...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Variable processing time

		// Simulate occasional processing failures
		if (Math.random() < 0.1) {
			throw new Error("File processing failed due to corrupted data");
		}

		console.log(`Batch file processing completed`);
		return files.map(file => ({ file, result: `Processed ${file}` }));
	};

	// Create batch processor with high concurrency
	const fileProcessor = createBatchProcessor(batchProcessFiles, {
		batchSize: 4,
		flushInterval: 1500,
		concurrency: 3,
		maxRetries: 2,
	});

	// Process a large number of files
	const files = Array.from({ length: 20 }, (_, i) => `file${i + 1}.txt`);

	const processPromises = files.map(file => fileProcessor.add(file));

	// Process results as they complete
	const results = await Promise.all(processPromises);
	console.log(`Processed ${results.length} files`);

	// Show some results
	console.log("Sample results:", results.slice(0, 5));

	// Check final stats
	const stats = fileProcessor.getStats();
	console.log("Final processor stats:", stats);
	console.log(
		`Success rate: ${((stats.processedItems / (stats.processedItems + stats.failedItems)) * 100).toFixed(1)}%`,
	);

	// Close processor
	await fileProcessor.close();
}

// Example 4: Real-time event batching
async function example4() {
	console.log("\n=== Batch Processor Example 4: Event Batching ===");

	// Simulate event logging operation
	const batchLogEvents = async (events: Array<{ type: string; timestamp: number; data: any }>): Promise<boolean[]> => {
		console.log(`Logging batch of ${events.length} events...`);
		await new Promise(resolve => setTimeout(resolve, 100)); // Fast logging

		// Simulate logging service being temporarily unavailable
		if (Math.random() < 0.05) {
			throw new Error("Logging service temporarily unavailable");
		}

		console.log(`Batch event logging completed`);
		return events.map(() => true); // All successful
	};

	// Create batch processor for real-time events
	const eventProcessor = createBatchProcessor(batchLogEvents, {
		batchSize: 10,
		flushInterval: 500, // Flush every 500ms for real-time feel
		maxRetries: 1,
	});

	// Simulate real-time event generation
	const eventTypes = ["click", "view", "submit", "error", "login"];

	// Generate events over time
	const eventPromises: Array<Promise<boolean>> = [];

	for (let i = 0; i < 25; i++) {
		const event = {
			type: eventTypes[Math.floor(Math.random() * eventTypes.length)]!,
			timestamp: Date.now(),
			data: { id: i, value: Math.random() },
		};

		eventPromises.push(eventProcessor.add(event));

		// Add events at random intervals to simulate real usage
		if (i < 24) {
			await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
		}
	}

	// Wait for all events to be processed
	const results = await Promise.all(eventPromises);
	console.log(`Processed ${results.length} events, ${results.filter(r => r).length} successful`);

	// Check stats
	const stats = eventProcessor.getStats();
	console.log("Event processor stats:", stats);

	// Close processor
	await eventProcessor.close();
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
	await example4();
}

runExamples().catch(console.error);
