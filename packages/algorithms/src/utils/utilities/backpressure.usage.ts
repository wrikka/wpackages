import { processWithBackpressure } from "./backpressure";

const items = Array.from({ length: 100 }, (_, i) => i);

await processWithBackpressure(items, async (item) => {
	console.log("Processing:", item);
	await new Promise((resolve) => setTimeout(resolve, 10));
}, { highWaterMark: 10, lowWaterMark: 5 });
