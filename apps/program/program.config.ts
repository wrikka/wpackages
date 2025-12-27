import { defineConfig } from "./src/config";

export default defineConfig({
	cache: {
		enabled: true,
		maxSize: 1000,
		ttl: 60000,
		evictionPolicy: "lru",
	},
	concurrency: {
		maxConcurrent: 10,
		queueSize: 100,
	},
	configManager: {
		enabled: true,
		expandVariables: true,
	},
});
