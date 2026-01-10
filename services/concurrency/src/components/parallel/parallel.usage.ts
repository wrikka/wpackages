import { firstSuccess, parallel, parallelCollect } from "./parallel";

// Example 1: Basic parallel execution
async function example1() {
	console.log("=== Parallel Example 1: Basic Parallel Execution ===");

	const fetchUserData = async (userId: number): Promise<{ id: number; name: string }> => {
		console.log(`Fetching user ${userId}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
		console.log(`Fetched user ${userId}`);
		return { id: userId, name: `User ${userId}` };
	};

	const userFetchers = Array.from({ length: 5 }, (_, i) => () => fetchUserData(i + 1));

	const results = await parallel(userFetchers);

	console.log("Parallel execution results:");
	results.forEach((result, index) => {
		if (result.success) {
			console.log(`  User ${index + 1}:`, result.value);
		} else {
			console.log(`  User ${index + 1}: Failed -`, result.error?.message);
		}
	});
}

// Example 2: Parallel execution with concurrency control
async function example2() {
	console.log("\n=== Parallel Example 2: Concurrency Control ===");

	const processData = async (id: number): Promise<string> => {
		console.log(`Processing item ${id}...`);
		await new Promise(resolve => setTimeout(resolve, 300));
		console.log(`Processed item ${id}`);
		return `Result ${id}`;
	};

	const processors = Array.from({ length: 10 }, (_, i) => () => processData(i + 1));

	// Limit to 3 concurrent operations
	const start = Date.now();
	const results = await parallel(processors, { concurrency: 3 });
	const end = Date.now();

	console.log(`Processed ${results.length} items in ${end - start}ms`);
	console.log("Success count:", results.filter(r => r.success).length);
	console.log("Failure count:", results.filter(r => !r.success).length);
}

// Example 3: Parallel collection
async function example3() {
	console.log("\n=== Parallel Example 3: Result Collection ===");

	const riskyOperation = async (id: number): Promise<number> => {
		console.log(`Running operation ${id}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

		// Randomly fail some operations
		if (Math.random() < 0.3) {
			throw new Error(`Operation ${id} failed`);
		}

		console.log(`Operation ${id} succeeded`);
		return id * 10;
	};

	const operations = Array.from({ length: 8 }, (_, i) => () => riskyOperation(i + 1));

	const { success, errors } = await parallelCollect(operations);

	console.log("Successful operations:", success);
	console.log("Failed operations:", errors.length);
	console.log("Error messages:", errors.map(e => e.message));
}

// Example 4: First success pattern
async function example4() {
	console.log("\n=== Parallel Example 4: First Success Pattern ===");

	const fetchFromSource = async (source: string): Promise<string> => {
		console.log(`Trying source: ${source}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

		// Simulate some sources being down
		if (source === "primary" || source === "backup2") {
			throw new Error(`Source ${source} unavailable`);
		}

		console.log(`Success from source: ${source}`);
		return `Data from ${source}`;
	};

	const sources = ["primary", "backup1", "backup2", "fallback"];
	const fetchers = sources.map(source => () => fetchFromSource(source));

	try {
		const result = await firstSuccess(fetchers);
		console.log("First successful result:", result);
	} catch (error) {
		console.log("All sources failed:", error instanceof Error ? error.message : String(error));
	}
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
	await example4();
}

runExamples().catch(console.error);
