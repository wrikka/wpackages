/**
 * Remote Configuration Service
 * Load configuration from HTTP endpoints with caching and fallback
 */

import { createConfigError, createNetworkErrorMessage } from "../utils/error-handler";

/**
 * Remote configuration options
 */
export interface RemoteConfigOptions {
	url: string;
	method?: "GET" | "POST";
	headers?: Record<string, string>;
	timeout?: number;
	retries?: number;
	cache?: boolean;
	cacheTtl?: number; // Time to live in milliseconds
}

// In-memory cache for remote configurations
const configCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

/**
 * Fetch configuration from remote endpoint
 */
export const fetchRemoteConfig = async <T>(
	options: RemoteConfigOptions,
): Promise<T> => {
	const {
		url,
		method = "GET",
		headers = {},
		timeout = 5000,
		retries = 3,
		cache = true,
		cacheTtl = 300000, // 5 minutes
	} = options;

	// Check cache first
	if (cache && configCache.has(url)) {
		const cached = configCache.get(url)!;
		if (Date.now() - cached.timestamp < cached.ttl) {
			return cached.data as T;
		} else {
			// Remove expired cache
			configCache.delete(url);
		}
	}

	// Try to fetch with retries
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			const response = await fetch(url, {
				method,
				headers,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			// Cache the result if enabled
			if (cache) {
				configCache.set(url, { data, timestamp: Date.now(), ttl: cacheTtl });
			}

			return data as T;
		} catch (error) {
			lastError = error as Error;

			// Don't retry on abort errors
			if (error instanceof Error && error.name === "AbortError") {
				break;
			}

			// Wait before retry with exponential backoff
			if (attempt < retries) {
				await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));
			}
		}
	}

	throw createConfigError(createNetworkErrorMessage(url, lastError), lastError);
};

/**
 * Clear remote configuration cache
 */
export const clearRemoteConfigCache = (url?: string): void => {
	if (url) {
		configCache.delete(url);
	} else {
		configCache.clear();
	}
};

/**
 * Get cache statistics
 */
export const getRemoteConfigCacheStats = (): { size: number; entries: string[] } => {
	return {
		size: configCache.size,
		entries: Array.from(configCache.keys()),
	};
};
