import { err, ok } from "functional";
import { createTask } from "./creators";
import {
	withTaskBulkhead,
	withTaskCircuitBreaker,
	withTaskRateLimit,
	withTaskRetry,
	withTaskTimeout,
} from "./resilience";

// Example of creating a task with retry pattern
const taskWithRetry = withTaskRetry(
	createTask("fetch-data", async () => {
		// Simulate a task that might fail
		if (Math.random() > 0.7) {
			return ok("Data fetched successfully");
		} else {
			return err(new Error("Network error"));
		}
	}),
	{
		maxAttempts: 3,
		strategy: "exponential",
		baseDelay: 1000,
	},
);

// Example of creating a task with timeout pattern
const taskWithTimeout = withTaskTimeout(
	createTask("slow-operation", async () => {
		// Simulate a slow operation
		await new Promise(resolve => setTimeout(resolve, 2000));
		return ok("Operation completed");
	}),
	1000, // 1 second timeout
);

// Example of creating a task with circuit breaker pattern
const taskWithCircuitBreaker = withTaskCircuitBreaker(
	createTask("unstable-service", async () => {
		// Simulate an unstable service
		if (Math.random() > 0.5) {
			return ok("Service call succeeded");
		} else {
			return err(new Error("Service unavailable"));
		}
	}),
	3, // Trip after 3 failures
);

// Example of creating a task with bulkhead pattern
const taskWithBulkhead = withTaskBulkhead(
	createTask("resource-intensive", async () => {
		// Simulate a resource-intensive operation
		await new Promise(resolve => setTimeout(resolve, 1000));
		return ok("Resource intensive operation completed");
	}),
	5, // Allow maximum 5 concurrent executions
);

// Example of creating a task with rate limiting pattern
const taskWithRateLimit = withTaskRateLimit(
	createTask("api-call", async () => {
		// Simulate an API call
		return ok("API call completed");
	}),
	10, // Limit to 10 requests per second
);

// Example of combining multiple resilience patterns
const highlyResilientTask = withTaskRateLimit(
	withTaskBulkhead(
		withTaskCircuitBreaker(
			withTaskTimeout(
				withTaskRetry(
					createTask("complex-operation", async () => {
						// Simulate a complex operation that might fail
						if (Math.random() > 0.3) {
							return ok("Complex operation succeeded");
						} else {
							return err(new Error("Complex operation failed"));
						}
					}),
					{
						maxAttempts: 3,
						strategy: "exponential",
						baseDelay: 500,
					},
				),
				5000, // 5 second timeout
			),
			3, // Trip after 3 failures
		),
		10, // Allow maximum 10 concurrent executions
	),
	5, // Limit to 5 requests per second
);

// Usage examples
async function runExamples() {
	console.log("Running task with retry...");
	const retryResult = await taskWithRetry.execute(undefined);
	console.log("Retry result:", retryResult);

	console.log("Running task with timeout...");
	const timeoutResult = await taskWithTimeout.execute(undefined);
	console.log("Timeout result:", timeoutResult);

	console.log("Running task with circuit breaker...");
	const circuitBreakerResult = await taskWithCircuitBreaker.execute(undefined);
	console.log("Circuit breaker result:", circuitBreakerResult);

	console.log("Running task with bulkhead...");
	const bulkheadResult = await taskWithBulkhead.execute(undefined);
	console.log("Bulkhead result:", bulkheadResult);

	console.log("Running task with rate limit...");
	const rateLimitResult = await taskWithRateLimit.execute(undefined);
	console.log("Rate limit result:", rateLimitResult);

	console.log("Running highly resilient task...");
	const resilientResult = await highlyResilientTask.execute(undefined);
	console.log("Resilient task result:", resilientResult);
}

// Run the examples
runExamples().catch(console.error);
