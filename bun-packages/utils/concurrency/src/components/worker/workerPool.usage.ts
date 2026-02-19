import { createWorkerPool } from "./workerPool";

// Example 1: Image processing with worker pool
async function example1() {
	console.log("=== Worker Pool Example 1: Image Processing ===");

	const imagePool = createWorkerPool({ maxWorkers: 3 });

	const processImage = async (imageId: string): Promise<string> => {
		console.log(`Processing image ${imageId}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
		console.log(`Finished processing image ${imageId}`);
		return `Processed image ${imageId}`;
	};

	// Process multiple images concurrently
	const imageIds = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg"];

	const results = await Promise.all(
		imageIds.map(id => imagePool.submit(() => processImage(id))),
	);

	console.log("All images processed:", results);

	// Check pool stats
	const stats = imagePool.getStats();
	console.log("Pool stats:", stats);

	await imagePool.terminate();
}

// Example 2: Data processing batch
async function example2() {
	console.log("\n=== Worker Pool Example 2: Data Processing Batch ===");

	const dataPool = createWorkerPool({ maxWorkers: 2 });

	const processData = async (dataId: number): Promise<{ id: number; result: string }> => {
		console.log(`Processing data item ${dataId}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
		return { id: dataId, result: `Processed data ${dataId}` };
	};

	// Submit a batch of data processing tasks
	const dataItems = Array.from({ length: 10 }, (_, i) => i + 1);
	const results = await dataPool.submitBatch(
		dataItems.map(id => () => processData(id)),
	);

	console.log("Batch processing completed:", results);

	// Check pool stats
	const stats = dataPool.getStats();
	console.log("Pool stats:", stats);

	await dataPool.terminate();
}

// Example 3: API request batching
async function example3() {
	console.log("\n=== Worker Pool Example 3: API Request Batching ===");

	const apiPool = createWorkerPool({ maxWorkers: 4 });

	const makeApiRequest = async (endpoint: string): Promise<{ endpoint: string; data: any }> => {
		console.log(`Making API request to ${endpoint}...`);
		await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
		return { endpoint, data: { message: `Response from ${endpoint}` } };
	};

	// Submit various API requests
	const endpoints = [
		"/users",
		"/products",
		"/orders",
		"/analytics",
		"/notifications",
		"/settings",
	];

	const results = await Promise.all(
		endpoints.map(endpoint => apiPool.submit(() => makeApiRequest(endpoint))),
	);

	console.log("API requests completed:", results);

	// Check pool stats
	const stats = apiPool.getStats();
	console.log("Pool stats:", stats);

	await apiPool.terminate();
}

// Run all examples
async function runExamples() {
	await example1();
	await example2();
	await example3();
}

runExamples().catch(console.error);
