// Example functions demonstrating best practices.

export async function successfulFetch() {
	// Mocks a successful API call
	return new Promise(resolve => setTimeout(() => resolve({ data: "success" }), 50));
}

export async function failedFetch() {
	// Mocks a failed API call
	return new Promise((_, reject) => setTimeout(() => reject(new Error("API Failure")), 50));
}

export async function fetchDataWithHandling() {
	try {
		const result = await failedFetch();
		return result;
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message };
		}
		return { error: "An unknown error occurred" };
	}
}

export async function parallelFetches() {
	try {
		const results = await Promise.all([successfulFetch(), successfulFetch()]);
		return results;
	} catch {
		// This block will run if any of the promises in Promise.all reject.
		return { error: "One of the fetches failed" };
	}
}
