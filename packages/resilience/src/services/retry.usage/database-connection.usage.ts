import { retry } from "../retry";

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
