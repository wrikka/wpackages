/**
 * Rate limiting algorithms
 */

// Types
export type RateLimitAlgorithm = "token-bucket" | "sliding-window" | "fixed-window";

export type RateLimiterConfig = {
	algorithm: RateLimitAlgorithm;
	capacity?: number;
	refillRate?: number;
	maxRequests?: number;
	windowMs?: number;
};

export type RateLimitResult = {
	allowed: boolean;
	remaining: number;
	resetIn: number;
	limit: number;
};

export type RateLimiter = {
	check: (key: string) => Promise<RateLimitResult>;
	reset: (key: string) => Promise<void>;
	getUsage: (key: string) => Promise<{ count: number; limit: number }>;
};

// Fixed Window Algorithm
type WindowData = {
	count: number;
	windowStart: number;
};

export const createFixedWindow = (config: RateLimiterConfig): RateLimiter => {
	const maxRequests = config.maxRequests || 100;
	const windowMs = config.windowMs || 60_000;
	const windows = new Map<string, WindowData>();

	const getCurrentWindow = (now: number): number => {
		return Math.floor(now / windowMs) * windowMs;
	};

	return {
		check: async (key: string): Promise<RateLimitResult> => {
			const now = Date.now();
			const windowStart = getCurrentWindow(now);
			const data = windows.get(key);

			if (!data || data.windowStart !== windowStart) {
				windows.set(key, { count: 1, windowStart });

				return {
					allowed: true,
					limit: maxRequests,
					remaining: maxRequests - 1,
					resetIn: windowMs - (now - windowStart),
				};
			}

			if (data.count < maxRequests) {
				data.count++;
				windows.set(key, data);

				return {
					allowed: true,
					limit: maxRequests,
					remaining: maxRequests - data.count,
					resetIn: windowMs - (now - windowStart),
				};
			}

			return {
				allowed: false,
				limit: maxRequests,
				remaining: 0,
				resetIn: windowMs - (now - windowStart),
			};
		},

		getUsage: async (
			key: string,
		): Promise<{ count: number; limit: number }> => {
			const now = Date.now();
			const windowStart = getCurrentWindow(now);
			const data = windows.get(key);

			const count = data && data.windowStart === windowStart ? data.count : 0;

			return {
				count,
				limit: maxRequests,
			};
		},

		reset: async (key: string): Promise<void> => {
			windows.delete(key);
		},
	};
};

// Sliding Window Algorithm
type WindowEntry = {
	timestamps: number[];
};

export const createSlidingWindow = (config: RateLimiterConfig): RateLimiter => {
	const maxRequests = config.maxRequests || 100;
	const windowMs = config.windowMs || 60_000;
	const windows = new Map<string, WindowEntry>();

	const cleanupOld = (entry: WindowEntry, now: number): number[] => {
		return entry.timestamps.filter((ts) => now - ts < windowMs);
	};

	return {
		check: async (key: string): Promise<RateLimitResult> => {
			const now = Date.now();
			const entry = windows.get(key) || { timestamps: [] };

			entry.timestamps = cleanupOld(entry, now);

			if (entry.timestamps.length < maxRequests) {
				entry.timestamps.push(now);
				windows.set(key, entry);

				const remaining = maxRequests - entry.timestamps.length;
				const oldestTs = entry.timestamps[0] || now;

				return {
					allowed: true,
					limit: maxRequests,
					remaining,
					resetIn: Math.max(0, windowMs - (now - oldestTs)),
				};
			}

			const oldestTs = entry.timestamps[0] || now;

			return {
				allowed: false,
				limit: maxRequests,
				remaining: 0,
				resetIn: Math.max(0, windowMs - (now - oldestTs)),
			};
		},

		getUsage: async (
			key: string,
		): Promise<{ count: number; limit: number }> => {
			const now = Date.now();
			const entry = windows.get(key) || { timestamps: [] };
			const timestamps = cleanupOld(entry, now);

			return {
				count: timestamps.length,
				limit: maxRequests,
			};
		},

		reset: async (key: string): Promise<void> => {
			windows.delete(key);
		},
	};
};

// Token Bucket Algorithm
type TokenBucket = {
	tokens: number;
	lastRefill: number;
};

export const createTokenBucket = (config: RateLimiterConfig): RateLimiter => {
	const capacity = config.capacity || 100;
	const refillRate = config.refillRate || 10;
	const buckets = new Map<string, TokenBucket>();

	const refill = (bucket: TokenBucket, now: number): TokenBucket => {
		const elapsed = now - bucket.lastRefill;
		const tokensToAdd = (elapsed / 1000) * refillRate;

		return {
			lastRefill: now,
			tokens: Math.min(capacity, bucket.tokens + tokensToAdd),
		};
	};

	return {
		check: async (key: string): Promise<RateLimitResult> => {
			const now = Date.now();
			let bucket = buckets.get(key) || { lastRefill: now, tokens: capacity };

			bucket = refill(bucket, now);

			if (bucket.tokens >= 1) {
				bucket.tokens -= 1;
				buckets.set(key, bucket);

				return {
					allowed: true,
					limit: capacity,
					remaining: Math.floor(bucket.tokens),
					resetIn: Math.ceil(((capacity - bucket.tokens) / refillRate) * 1000),
				};
			}

			buckets.set(key, bucket);

			return {
				allowed: false,
				limit: capacity,
				remaining: 0,
				resetIn: Math.ceil(((1 - bucket.tokens) / refillRate) * 1000),
			};
		},

		getUsage: async (
			key: string,
		): Promise<{ count: number; limit: number }> => {
			const bucket = buckets.get(key);
			const used = bucket ? capacity - Math.floor(bucket.tokens) : 0;

			return {
				count: used,
				limit: capacity,
			};
		},

		reset: async (key: string): Promise<void> => {
			buckets.delete(key);
		},
	};
};
