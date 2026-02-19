import { createRateLimiter } from "./rateLimiter";

// Example 1: API rate limiting
async function example1() {
	console.log("=== Rate Limiter Example 1: API Rate Limiting ===");

	// Limit to 5 requests per second
	const apiLimiter = createRateLimiter({ maxRequests: 5, interval: 1000 });

	const makeApiRequest = async (id: number): Promise<string> => {
		console.log(`Making API request ${id} at ${new Date().toISOString()}`);
		await new Promise(resolve => setTimeout(resolve, 50));
		return `Response ${id}`;
	};

	// Make 10 requests - first 5 immediate, next 5 delayed
	const start = Date.now();
	const requests = Array.from({ length: 10 }, async (_, i) => {
		await apiLimiter.wait();
		return makeApiRequest(i + 1);
	});

	const results = await Promise.all(requests);
	const end = Date.now();

	console.log("All requests completed:", results);
	console.log(`Total time: ${end - start}ms`);

	// Check stats
	const stats = apiLimiter.getStats();
	console.log("Rate limiter stats:", stats);
}

// Example 2: Database query rate limiting
async function example2() {
	console.log("\n=== Rate Limiter Example 2: Database Query Rate Limiting ===");

	// Limit to 3 queries per 500ms
	const dbLimiter = createRateLimiter({ maxRequests: 3, interval: 500 });

	const executeQuery = async (query: string): Promise<{ query: string; result: string }> => {
		console.log(`Executing query: ${query} at ${new Date().toISOString()}`);
		await new Promise(resolve => setTimeout(resolve, 100));
		return { query, result: `Result for ${query}` };
	};

	// Execute multiple queries
	const queries = [
		"SELECT * FROM users",
		"SELECT * FROM products",
		"SELECT * FROM orders",
		"UPDATE users SET last_login = NOW()",
		"INSERT INTO logs (message) VALUES ('User login')",
		"DELETE FROM sessions WHERE expired = true",
	];

	const start = Date.now();
	const results = await Promise.all(
		queries.map(async (query) => {
			await dbLimiter.wait();
			return executeQuery(query);
		}),
	);
	const end = Date.now();

	console.log("All queries completed:", results);
	console.log(`Total time: ${end - start}ms`);
}

// Example 3: File processing with rate limiting
async function example3() {
	console.log("\n=== Rate Limiter Example 3: File Processing Rate Limiting ===");

	// Limit to 2 file operations per second
	const fileLimiter = createRateLimiter({ maxRequests: 2, interval: 1000 });

	const processFile = async (filename: string): Promise<string> => {
		console.log(`Processing file: ${filename} at ${new Date().toISOString()}`);
		await new Promise(resolve => setTimeout(resolve, 200));
		return `Processed ${filename}`;
	};

	// Process multiple files
	const files = [
		"document1.pdf",
		"image1.jpg",
		"video1.mp4",
		"document2.pdf",
		"image2.jpg",
		"data.csv",
	];

	const start = Date.now();
	const results = await Promise.all(
		files.map(async (file) => {
			await fileLimiter.wait();
			return processFile(file);
		}),
	);
	const end = Date.now();

	console.log("All files processed:", results);
	console.log(`Total time: ${end - start}ms`);

	// Reset and check stats
	fileLimiter.reset();
	const stats = fileLimiter.getStats();
	console.log("After reset - Rate limiter stats:", stats);
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
}

runExamples().catch(console.error);
