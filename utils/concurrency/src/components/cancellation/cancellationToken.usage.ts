import { createCancellationTokenSource, withCancellation } from "./cancellationToken";

// Example 1: Basic cancellation
async function example1() {
	console.log("=== Cancellation Token Example 1: Basic Cancellation ===");

	const source = createCancellationTokenSource();

	const longRunningTask = async (): Promise<string> => {
		console.log("Task started...");

		// Simulate work that checks for cancellation
		for (let i = 0; i < 10; i++) {
			source.token.throwIfCancelled();
			await new Promise(resolve => setTimeout(resolve, 100));
			console.log(`Task progress: ${i + 1}/10`);
		}

		return "Task completed successfully";
	};

	// Start the task and cancel it after 500ms
	const taskPromise = longRunningTask();

	setTimeout(() => {
		console.log("Cancelling task...");
		source.cancel();
	}, 500);

	try {
		const result = await taskPromise;
		console.log("Result:", result);
	} catch (error) {
		console.log("Task was cancelled:", error instanceof Error ? error.message : String(error));
	}
}

// Example 2: Using withCancellation helper
async function example2() {
	console.log("\n=== Cancellation Token Example 2: withCancellation Helper ===");

	const source = createCancellationTokenSource();

	const fetchData = async (): Promise<{ data: string }> => {
		console.log("Fetching data...");
		await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
		console.log("Data fetched");
		return { data: "Important data" };
	};

	// Wrap the promise with cancellation support
	const cancellablePromise = withCancellation(fetchData(), source.token);

	// Cancel after 1 second
	setTimeout(() => {
		console.log("Cancelling data fetch...");
		source.cancel();
	}, 1000);

	try {
		const result = await cancellablePromise;
		console.log("Data:", result);
	} catch (error) {
		console.log("Fetch was cancelled:", error instanceof Error ? error.message : String(error));
	}
}

// Example 3: Multiple cancellation callbacks
async function example3() {
	console.log("\n=== Cancellation Token Example 3: Multiple Callbacks ===");

	const source = createCancellationTokenSource();

	// Register multiple callbacks
	source.token.onCancelled(() => {
		console.log("Callback 1: Cleanup database connection");
	});

	source.token.onCancelled(() => {
		console.log("Callback 2: Release file handles");
	});

	source.token.onCancelled(() => {
		console.log("Callback 3: Notify user interface");
	});

	// Simulate some work
	console.log("Starting work...");
	await new Promise(resolve => setTimeout(resolve, 500));

	// Cancel
	console.log("Triggering cancellation...");
	source.cancel();

	console.log("Cancellation completed");
}

// Example 4: Cancellation with cleanup
async function example4() {
	console.log("\n=== Cancellation Token Example 4: Cancellation with Cleanup ===");

	const source = createCancellationTokenSource();
	let resource: string | null = null;

	const complexTask = async (): Promise<string> => {
		console.log("Acquiring resource...");
		resource = "Database connection";
		console.log("Resource acquired:", resource);

		try {
			// Register cleanup callback
			source.token.onCancelled(() => {
				if (resource) {
					console.log("Cleaning up resource:", resource);
					resource = null;
				}
			});

			// Simulate long-running work
			for (let i = 0; i < 20; i++) {
				source.token.throwIfCancelled();
				await new Promise(resolve => setTimeout(resolve, 200));
				console.log(`Work progress: ${i + 1}/20`);
			}

			return "Complex task completed";
		} catch (_error) {
			// Ensure cleanup happens even if cancelled
			if (resource) {
				console.log("Cleaning up resource due to error:", resource);
				resource = null;
			}
			throw _error;
		}
	};

	// Start task and cancel after 2 seconds
	const taskPromise = complexTask();

	setTimeout(() => {
		console.log("Cancelling complex task...");
		source.cancel();
	}, 2000);

	try {
		const result = await taskPromise;
		console.log("Result:", result);
	} catch (error) {
		console.log("Task was cancelled:", error instanceof Error ? error.message : String(error));
	}

	console.log("Resource status:", resource);
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
	await example4();
}

runExamples().catch(console.error);
