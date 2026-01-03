import { isOk } from "../types/result";
import {
	executeWithRetry,
	retryAll,
	retryAny,
	retryOnExitCodes,
	retryOnNetworkError,
	retryOnTimeout,
	retryUntil,
} from "./retry";

// Example 1: Basic retry
console.log("=== Basic Retry ===");
const result1 = await executeWithRetry(
	{
		command: "curl",
		args: ["https://api.example.com"],
	},
	{
		retries: 3,
		retryDelay: 1000,
	},
);

if (isOk(result1)) {
	console.log("Success after retries");
} else {
	console.error("Failed after 3 retries");
}

// Example 2: Exponential backoff
console.log("\n=== Exponential Backoff ===");
await executeWithRetry(
	{
		command: "npm",
		args: ["install"],
	},
	{
		retries: 5,
		retryDelay: 1000, // 1s base delay
		backoffFactor: 2, // Double each time: 1s, 2s, 4s, 8s, 16s
		maxDelay: 10000, // Cap at 10s
		onRetry: (error, attempt) => {
			console.log(`Retry attempt ${attempt + 1}: ${error.message}`);
		},
	},
);

// Example 3: Retry only on timeout
console.log("\n=== Retry On Timeout Only ===");
await executeWithRetry(
	{
		command: "long-command",
		timeout: 5000,
	},
	{
		retries: 2,
		retryDelay: 500,
		shouldRetry: retryOnTimeout,
		onRetry: (_error, attempt) => {
			console.log(`Command timed out, retrying (attempt ${attempt + 1})`);
		},
	},
);

// Example 4: Retry on specific exit codes
console.log("\n=== Retry On Specific Exit Codes ===");
await executeWithRetry(
	{
		command: "git",
		args: ["push"],
	},
	{
		retries: 3,
		retryDelay: 2000,
		shouldRetry: retryOnExitCodes([128, 1]), // Retry on git errors
	},
);

// Example 5: Retry on network errors
console.log("\n=== Retry On Network Errors ===");
await executeWithRetry(
	{
		command: "curl",
		args: ["https://api.example.com"],
	},
	{
		retries: 5,
		retryDelay: 1000,
		shouldRetry: retryOnNetworkError,
	},
);

// Example 6: Combine retry conditions with AND
console.log("\n=== Combine Conditions (AND) ===");
await executeWithRetry(
	{
		command: "test-command",
	},
	{
		retries: 3,
		shouldRetry: retryAll(
			(error) => error.exitCode !== 0,
			(error) => error.stderr.includes("temporary"),
		),
	},
);

// Example 7: Combine retry conditions with OR
console.log("\n=== Combine Conditions (OR) ===");
await executeWithRetry(
	{
		command: "test-command",
	},
	{
		retries: 3,
		shouldRetry: retryAny(
			retryOnTimeout,
			retryOnNetworkError,
			(error) => error.exitCode === 1,
		),
	},
);

// Example 8: Retry with max attempts
console.log("\n=== Retry Until Max Attempts ===");
await executeWithRetry(
	{
		command: "flaky-command",
	},
	{
		retries: 10,
		retryDelay: 500,
		shouldRetry: retryUntil(5), // Only retry 5 times max
	},
);

// Example 9: Custom retry logic with logging
console.log("\n=== Custom Retry Logic ===");
const retryCount = { current: 0 };

await executeWithRetry(
	{
		command: "echo",
		args: ["test"],
	},
	{
		retries: 3,
		retryDelay: 1000,
		shouldRetry: (error, attempt) => {
			console.log(`Checking if should retry (attempt ${attempt})`);
			console.log(`Exit code: ${error.exitCode}`);
			console.log(`Timed out: ${error.timedOut}`);

			// Custom logic: retry if exit code is 1 or timed out
			return error.exitCode === 1 || error.timedOut;
		},
		onRetry: (error, attempt) => {
			retryCount.current++;
			console.log(`Retrying... (${attempt + 1}/${3})`);
			console.log(`Last error: ${error.message}`);
		},
	},
);

console.log(`Total retries: ${retryCount.current}`);

// Example 10: Retry with increasing timeout
console.log("\n=== Retry With Increasing Timeout ===");
for (let i = 0; i < 3; i++) {
	const timeout = 1000 * (i + 1); // 1s, 2s, 3s

	const result = await executeWithRetry(
		{
			command: "slow-command",
			timeout,
		},
		{
			retries: 0, // No automatic retry, we're doing it manually
		},
	);

	if (isOk(result)) {
		console.log(`Success with timeout ${timeout}ms`);
		break;
	}

	console.log(`Failed with timeout ${timeout}ms, increasing...`);
}
