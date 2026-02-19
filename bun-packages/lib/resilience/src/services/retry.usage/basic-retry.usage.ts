import { retry } from "../retry";

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
