import { createCache, memoize } from "services/cache/src";
import { logInfo } from "../utils/logger";

/**
 * Vitext Caching Service
 *
 * Provides caching capabilities for build artifacts, module resolution, and runtime performance.
 */

// Cache for build artifacts
const buildCache = createCache<string, unknown>({
	maxSize: 1000,
	ttl: 300000, // 5 minutes
	lru: true,
});

// Cache for module resolution
const moduleCache = createCache<string, unknown>({
	maxSize: 5000,
	ttl: 600000, // 10 minutes
	lru: true,
});

// Cache for file system operations
const fileCache = createCache<string, string>({
	maxSize: 1000,
	ttl: 300000, // 5 minutes
	lru: true,
});

// Memoized expensive operations
export const memoizedTransform = memoize((...args: unknown[]) => {
	const [code, _filename] = args as [string, string];
	logInfo(`Transforming module: ${_filename}`);
	// In a real implementation, this would transform the code
	return code;
});

export const memoizedResolve = memoize((...args: unknown[]) => {
	const [id, _importer] = args as [string, string | undefined];
	logInfo(`Resolving module: ${id}`);
	// In a real implementation, this would resolve the module
	return id;
});

/**
 * Cache service for vitext
 */
export class VitextCacheService {
	/**
	 * Cache build artifacts
	 */
	setBuildArtifact(key: string, value: unknown): void {
		buildCache.set(key, value);
	}

	getBuildArtifact(key: string): unknown | undefined {
		return buildCache.get(key);
	}

	/**
	 * Cache module resolution
	 */
	setModule(key: string, value: unknown): void {
		moduleCache.set(key, value);
	}

	getModule(key: string): unknown | undefined {
		return moduleCache.get(key);
	}

	/**
	 * Cache file contents
	 */
	setFile(key: string, value: string): void {
		fileCache.set(key, value);
	}

	getFile(key: string): string | undefined {
		return fileCache.get(key);
	}

	/**
	 * Clear all caches
	 */
	clear(): void {
		buildCache.clear();
		moduleCache.clear();
		fileCache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats(): { build: number; module: number; file: number } {
		return {
			build: buildCache.size(),
			module: moduleCache.size(),
			file: fileCache.size(),
		};
	}
}

// Global cache service instance
export const cacheService = new VitextCacheService();
