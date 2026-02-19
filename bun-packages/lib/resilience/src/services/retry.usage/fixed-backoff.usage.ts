import { retry } from "../retry";

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
