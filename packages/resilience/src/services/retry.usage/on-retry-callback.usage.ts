import { retry } from "../retry";

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
