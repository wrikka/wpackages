import {
	exponential,
	pipe,
	retryWithJitter,
	runPromise,
	timeout,
	TimeoutError,
	tryPromise,
	withBulkhead,
	withCircuitBreaker,
	withRateLimiter,
} from "@wpackages/effect";

// Retry with exponential backoff
const retryExample = async () => {
	let attemptCount = 0;

	const effect = retryWithJitter(
		tryPromise(
			() => {
				attemptCount++;
				if (attemptCount < 3) {
					throw new Error("Failed");
				}
				return Promise.resolve({ success: true });
			},
			(error) => ({ message: "Error", error }),
		),
		{
			maxRetries: 5,
			baseDelay: 100,
			maxDelay: 1000,
			jitter: exponential(100, 2),
		},
	);

	const result = await runPromise(effect);
	console.log("Retry:", result, `Attempts: ${attemptCount}`);
};

// Circuit breaker
const circuitBreakerExample = async () => {
	const effect = withCircuitBreaker(
		tryPromise(
			() => fetch("https://api.example.com/data"),
			(error) => ({ message: "Fetch failed", error }),
		),
		{
			failureThreshold: 5,
			successThreshold: 2,
			timeout: 60000,
			resetTimeout: 10000,
		},
	);

	const result = await runPromise(effect);
	console.log("Circuit Breaker:", result);
};

// Bulkhead
const bulkheadExample = async () => {
	const effect = withBulkhead(
		tryPromise(
			() => fetch("https://api.example.com/data"),
			(error) => ({ message: "Fetch failed", error }),
		),
		{
			maxConcurrent: 10,
			maxQueueSize: 100,
		},
	);

	const result = await runPromise(effect);
	console.log("Bulkhead:", result);
};

// Rate limiter
const rateLimiterExample = async () => {
	const effect = withRateLimiter(
		tryPromise(
			() => fetch("https://api.example.com/data"),
			(error) => ({ message: "Fetch failed", error }),
		),
		{
			maxRequests: 100,
			windowMs: 60000,
		},
	);

	const result = await runPromise(effect);
	console.log("Rate Limiter:", result);
};

// Timeout
const timeoutExample = async () => {
	const effect = timeout(
		tryPromise(
			() => new Promise((resolve) => setTimeout(() => resolve(42), 10000)),
			(error) => ({ message: "Error", error }),
		),
		1000,
		() => new TimeoutError("Operation timed out"),
	);

	const result = await runPromise(effect);
	console.log("Timeout:", result);
};

// Combined resilience
const combinedExample = async () => {
	const effect = pipe(
		tryPromise(
			() => fetch("https://api.example.com/data"),
			(error) => ({ message: "Fetch failed", error }),
		),
		retryWithJitter({
			maxRetries: 3,
			baseDelay: 1000,
			maxDelay: 10000,
			jitter: exponential(1000, 2),
		}),
		withCircuitBreaker({
			failureThreshold: 5,
			successThreshold: 2,
			timeout: 60000,
			resetTimeout: 10000,
		}),
		withBulkhead({
			maxConcurrent: 10,
			maxQueueSize: 100,
		}),
		timeout(
			5000,
			() => new TimeoutError("Operation timed out"),
		),
	);

	const result = await runPromise(effect);
	console.log("Combined:", result);
};

// Run all examples
const main = async () => {
	console.log("=== Resilience Examples ===\n");

	await retryExample();
	await circuitBreakerExample();
	await bulkheadExample();
	await rateLimiterExample();
	await timeoutExample();
	await combinedExample();
};

main();
