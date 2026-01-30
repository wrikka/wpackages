/**
 * Application composition using the caching library
 */

import { normalizeConfig } from "./components/cache-utils";
import { CacheService } from "./services/cache.service";
import type { CacheConfig } from "./types/cache.types";
import { createCache } from "./utils/cache";

/**
 * Application layer that composes all caching components
 */
export const createCachingApp = (config: CacheConfig = {}) => {
	// Normalize configuration
	const normalizedConfig = normalizeConfig(config);

	// Create core cache
	const cache = createCache(normalizedConfig);

	// Create service layer
	const cacheService = new CacheService(normalizedConfig);

	return {
		cache,
		cacheService,
		config: normalizedConfig,
	};
};

/**
 * Run the caching application
 */
export const runCachingApp = () => {
	console.log("Starting caching application...");

	const app = createCachingApp({
		maxSize: 100,
		ttl: 5000,
		lru: true,
	});

	console.log("Cache application initialized with config:", app.config);

	// Example usage
	app.cache.set("example-key", "example-value");
	const value = app.cache.get("example-key");

	console.log("Retrieved value:", value);

	return "Caching application running successfully";
};
