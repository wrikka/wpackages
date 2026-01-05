/**
 * Usage examples for the w-devserver package
 */

import { createDevServer } from "./index";

// Example 1: Basic usage
const server = createDevServer({
	port: 3000,
	hostname: "localhost",
	root: "./src",
});

// Example 2: Advanced configuration
const advancedServer = createDevServer({
	port: 4000,
	hostname: "127.0.0.1",
	root: "./src",
	watch: {
		ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/*.test.ts"],
		debounceMs: 200,
	},
	cache: {
		ttl: 600000, // 10 minutes
	},
});

// Example 3: Register reload callback
advancedServer.onReload(() => {
	console.log("Hot reload triggered!");
	// Perform custom reload logic
});

// Example 4: Start the server
async function startServer() {
	try {
		await server.start();
		console.log("Development server started successfully!");
	} catch (error) {
		console.error("Failed to start development server:", error);
	}
}

// Example 5: Get performance stats
setInterval(() => {
	const stats = server.getStats();
	const performance = server.getPerformanceStats();
	const recommendations = server.getRecommendations();

	console.log("Stats:", stats);
	console.log("Performance:", performance);
	console.log("Recommendations:", recommendations);
}, 5000);

// Start the server
void startServer();
