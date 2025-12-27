import { allSettledSafe, retryAsync, safeAsync, withFallback, withTimeout } from "./asyncError";

// Example 1: Safe async execution
async function example1() {
	console.log("=== Async Error Handling Example 1: Safe Execution ===");

	const fetchUserData = async (userId: number): Promise<{ id: number; name: string }> => {
		if (userId === 3) {
			throw new Error(`User ${userId} not found`);
		}
		return { id: userId, name: `User ${userId}` };
	};

	// Safe execution of potentially failing operations
	const results = await Promise.all([
		safeAsync(() => fetchUserData(1)),
		safeAsync(() => fetchUserData(2)),
		safeAsync(() => fetchUserData(3)), // This will fail
		safeAsync(() => fetchUserData(4)),
	]);

	console.log("Results:");
	results.forEach((result, index) => {
		if (result.success) {
			console.log(`  User ${index + 1}:`, result.value);
		} else {
			console.log(`  User ${index + 1}: Failed -`, result.error.message);
		}
	});
}

// Example 2: Retry with exponential backoff
async function example2() {
	console.log("\n=== Async Error Handling Example 2: Retry with Backoff ===");

	let attemptCount = 0;
	const unreliableApi = async (): Promise<string> => {
		attemptCount++;
		console.log(`API call attempt ${attemptCount}`);

		// Simulate intermittent failures
		if (attemptCount < 4) {
			throw new Error(`Network error on attempt ${attemptCount}`);
		}

		return "API call successful";
	};

	try {
		const start = Date.now();
		const result = await retryAsync(unreliableApi, {
			maxAttempts: 5,
			delay: 100,
			backoff: "exponential",
			jitter: true,
		});
		const end = Date.now();

		console.log("Result:", result);
		console.log(`Completed in ${end - start}ms after ${attemptCount} attempts`);
	} catch (error) {
		console.log("All retry attempts failed:", error instanceof Error ? error.message : String(error));
	}
}

// Example 3: Fallback values
async function example3() {
	console.log("\n=== Async Error Handling Example 3: Fallback Values ===");

	const getConfigFromServer = async (): Promise<Record<string, string>> => {
		// Simulate server failure
		throw new Error("Config server unavailable");
	};

	const defaultConfig = {
		theme: "light",
		language: "en",
		timeout: "5000",
	};

	// Try to get config from server, fallback to defaults
	const config = await withFallback(
		getConfigFromServer,
		defaultConfig,
		{
			logErrors: true,
			onError: (error) => {
				console.log("Failed to fetch config, using defaults:", error instanceof Error ? error.message : String(error));
			},
		},
	);

	console.log("Using config:", config);
}

// Example 4: All settled safe execution
async function example4() {
	console.log("\n=== Async Error Handling Example 4: All Settled Safe ===");

	const fetchFromService = async (service: string): Promise<string> => {
		console.log(`Fetching from ${service}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

		// Simulate some services being down
		if (service === "service-b" || service === "service-d") {
			throw new Error(`${service} is temporarily unavailable`);
		}

		return `Data from ${service}`;
	};

	const services = ["service-a", "service-b", "service-c", "service-d", "service-e"];
	const fetchers = services.map(service => () => fetchFromService(service));

	const results = await allSettledSafe(fetchers);

	console.log("Service results:");
	results.forEach((result, index) => {
		const service = services[index];
		if (result.success) {
			console.log(`  ${service}: ${result.value}`);
		} else {
			const errorMsg = result.error instanceof Error ? result.error.message : String(result.error);
			console.log(`  ${service}: Failed - ${errorMsg}`);
		}
	});

	const successful = results.filter(r => r.success).length;
	const failed = results.filter(r => !r.success).length;
	console.log(`\nSummary: ${successful} successful, ${failed} failed`);
}

// Example 5: Timeout handling
async function example5() {
	console.log("\n=== Async Error Handling Example 5: Timeout Handling ===");

	const slowOperation = async (duration: number): Promise<string> => {
		console.log(`Starting operation that takes ${duration}ms...`);
		await new Promise(resolve => setTimeout(resolve, duration));
		return `Operation completed after ${duration}ms`;
	};

	// Test operation that completes in time
	try {
		const result = await withTimeout(() => slowOperation(200), 500);
		console.log("Fast operation result:", result);
	} catch (error) {
		console.log("Fast operation failed:", error instanceof Error ? error.message : String(error));
	}

	// Test operation that times out
	try {
		const result = await withTimeout(() => slowOperation(1000), 500);
		console.log("Slow operation result:", result);
	} catch (error) {
		console.log("Slow operation failed:", error instanceof Error ? error.message : String(error));
	}
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
	await example4();
	await example5();
}

runExamples().catch(console.error);
