/**
 * Usage examples for retry service
 */

import { createRetryPolicy, retry } from "./retry";

// Example 1: Basic retry with default settings
export const example1_basicRetry = async () => {
	let attempts = 0;

	const unreliableAPI = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("API temporarily unavailable");
		}
		return { status: "success", data: "Hello" };
	};

	const result = await retry(unreliableAPI);
	console.log("Result:", result);
	// Output: { success: true, value: {...}, attempts: 3, totalDuration: ... }
};

// Example 2: Retry with custom max attempts
export const example2_customMaxAttempts = async () => {
	let attempts = 0;

	const fetchData = async () => {
		attempts++;
		if (attempts < 5) {
			throw new Error("Connection timeout");
		}
		return "Data";
	};

	const result = await retry(fetchData, { maxAttempts: 5 });
	console.log("Result:", result);
	// Output: { success: true, value: "Data", attempts: 5, ... }
};

// Example 3: Retry with exponential backoff
export const example3_exponentialBackoff = async () => {
	let attempts = 0;

	const callService = async () => {
		attempts++;
		console.log(`Attempt ${attempts}`);
		if (attempts < 3) {
			throw new Error("Service error");
		}
		return "Success";
	};

	const result = await retry(callService, {
		maxAttempts: 3,
		baseDelay: 100,
		strategy: "exponential",
	});

	console.log("Result:", result);
	// Output: Attempts with exponential delays (100ms, 200ms)
};

// Example 4: Retry with linear backoff
export const example4_linearBackoff = async () => {
	let attempts = 0;

	const operation = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("Fail");
		}
		return "Success";
	};

	const result = await retry(operation, {
		maxAttempts: 3,
		baseDelay: 50,
		strategy: "linear",
	});

	console.log("Result:", result);
	// Output: Attempts with linear delays (50ms, 100ms)
};

// Example 5: Retry with fixed backoff
export const example5_fixedBackoff = async () => {
	let attempts = 0;

	const task = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("Fail");
		}
		return "Done";
	};

	const result = await retry(task, {
		maxAttempts: 3,
		baseDelay: 100,
		strategy: "fixed",
	});

	console.log("Result:", result);
	// Output: Attempts with fixed delays (100ms, 100ms)
};

// Example 6: Retry with shouldRetry predicate
export const example6_shouldRetryPredicate = async () => {
	let attempts = 0;

	const fetchAPI = async () => {
		attempts++;
		if (attempts < 2) {
			throw new Error("Temporary error");
		}
		if (attempts === 2) {
			throw new Error("Permanent error");
		}
		return "Success";
	};

	const result = await retry(fetchAPI, {
		maxAttempts: 5,
		shouldRetry: (error) => {
			// Only retry on temporary errors
			return error.message.includes("Temporary");
		},
	});

	console.log("Result:", result);
	// Output: { success: false, error: Error("Permanent error"), attempts: 2, ... }
};

// Example 7: Retry with onRetry callback
export const example7_onRetryCallback = async () => {
	let attempts = 0;

	const operation = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("Fail");
		}
		return "Success";
	};

	const result = await retry(operation, {
		maxAttempts: 3,
		baseDelay: 50,
		onRetry: (attempt, error, delay) => {
			console.log(`Retry attempt ${attempt}: ${error.message}, waiting ${delay}ms`);
		},
	});

	console.log("Result:", result);
	// Output: Retry logs and then success
};

// Example 8: Retry with max delay cap
export const example8_maxDelayCap = async () => {
	let attempts = 0;

	const slowService = async () => {
		attempts++;
		if (attempts < 4) {
			throw new Error("Service busy");
		}
		return "Response";
	};

	const result = await retry(slowService, {
		maxAttempts: 4,
		baseDelay: 1000,
		maxDelay: 200, // Cap delays at 200ms
		strategy: "exponential",
	});

	console.log("Result:", result);
	// Output: Delays capped at 200ms
};

// Example 9: Real-world scenario - Database connection retry
export const example9_databaseConnection = async () => {
	let attempts = 0;

	const connectToDatabase = async () => {
		attempts++;
		console.log(`Database connection attempt ${attempts}`);

		if (attempts < 2) {
			throw new Error("Connection refused");
		}

		return {
			connected: true,
			connectionString: "postgresql://localhost/mydb",
		};
	};

	const result = await retry(connectToDatabase, {
		maxAttempts: 3,
		baseDelay: 500,
		strategy: "exponential",
		onRetry: (attempt, error) => {
			console.warn(`Database connection failed (attempt ${attempt}): ${error.message}`);
		},
	});

	if (result.success) {
		console.log("Connected to database:", result.value);
	} else {
		console.error("Failed to connect after", result.attempts, "attempts");
	}
};

// Example 10: Using retry policy factory
export const example10_retryPolicy = async () => {
	const policy = createRetryPolicy({
		maxRetries: 5,
		retryDelay: 200,
		exponentialBackoff: true,
		maxDelay: 5000,
	});

	let attempts = 0;

	const apiCall = async () => {
		attempts++;
		if (attempts < 3) {
			throw new Error("API error");
		}
		return { data: "response" };
	};

	const result = await retry(apiCall, {
		maxAttempts: policy.maxRetries ?? 3,
		baseDelay: policy.retryDelay ?? 1000,
		strategy: policy.exponentialBackoff ? "exponential" : "fixed",
		maxDelay: policy.maxDelay ?? 30000,
	});

	console.log("Result:", result);
};

// Example 11: Chaining retries with other operations
export const example11_chainingRetries = async () => {
	let fetchAttempts = 0;
	let processAttempts = 0;

	const fetchData = async () => {
		fetchAttempts++;
		if (fetchAttempts < 2) {
			throw new Error("Fetch failed");
		}
		return [1, 2, 3];
	};

	const processData = async (data: number[]) => {
		processAttempts++;
		if (processAttempts < 2) {
			throw new Error("Process failed");
		}
		return data.reduce((a, b) => a + b, 0);
	};

	const fetchResult = await retry(fetchData, { maxAttempts: 3 });

	if (fetchResult.success && fetchResult.value !== undefined) {
		const data = fetchResult.value;
		const processResult = await retry(
			() => processData(data),
			{ maxAttempts: 3 },
		);

		if (processResult.success) {
			console.log("Final result:", processResult.value);
		}
	}
};

// Example 12: Retry with timeout consideration
export const example12_retryWithTimeout = async () => {
	let attempts = 0;

	const slowOperation = async () => {
		attempts++;
		// Simulate slow operation
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (attempts < 2) {
			throw new Error("Slow operation failed");
		}
		return "Completed";
	};

	const result = await retry(slowOperation, {
		maxAttempts: 3,
		baseDelay: 50,
		maxDelay: 500,
	});

	console.log("Result:", result);
	console.log("Total time:", result.totalDuration, "ms");
};
