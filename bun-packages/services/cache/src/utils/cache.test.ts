/**
 * Tests for the core cache implementation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCache } from "./cache";

describe("FunctionalCache", () => {
	let cache: ReturnType<typeof createCache>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(0));
		cache = createCache();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("set and get", () => {
		it("should store and retrieve values", () => {
			cache.set("key1", "value1");
			expect(cache.get("key1")).toBe("value1");
		});

		it("should return undefined for non-existent keys", () => {
			expect(cache.get("non-existent")).toBeUndefined();
		});

		it("should overwrite existing values", () => {
			cache.set("key", "value1");
			cache.set("key", "value2");
			expect(cache.get("key")).toBe("value2");
		});
	});

	describe("has", () => {
		it("should return true for existing keys", () => {
			cache.set("key", "value");
			expect(cache.has("key")).toBe(true);
		});

		it("should return false for non-existent keys", () => {
			expect(cache.has("non-existent")).toBe(false);
		});
	});

	describe("delete", () => {
		it("should remove existing keys", () => {
			cache.set("key", "value");
			expect(cache.delete("key")).toBe(true);
			expect(cache.has("key")).toBe(false);
		});

		it("should return false for non-existent keys", () => {
			expect(cache.delete("non-existent")).toBe(false);
		});
	});

	describe("clear", () => {
		it("should remove all entries", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");
			expect(cache.size()).toBe(2);

			cache.clear();
			expect(cache.size()).toBe(0);
			expect(cache.get("key1")).toBeUndefined();
			expect(cache.get("key2")).toBeUndefined();
		});
	});

	describe("size", () => {
		it("should return the correct number of entries", () => {
			expect(cache.size()).toBe(0);

			cache.set("key1", "value1");
			expect(cache.size()).toBe(1);

			cache.set("key2", "value2");
			expect(cache.size()).toBe(2);

			cache.delete("key1");
			expect(cache.size()).toBe(1);
		});
	});

	describe("keys, values, entries", () => {
		it("should return all keys", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const keys = cache.keys();
			expect(keys).toContain("key1");
			expect(keys).toContain("key2");
			expect(keys).toHaveLength(2);
		});

		it("should return all values", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const values = cache.values();
			expect(values).toContain("value1");
			expect(values).toContain("value2");
			expect(values).toHaveLength(2);
		});

		it("should return all entries", () => {
			cache.set("key1", "value1");
			cache.set("key2", "value2");

			const entries = cache.entries();
			expect(entries).toContainEqual(["key1", "value1"]);
			expect(entries).toContainEqual(["key2", "value2"]);
			expect(entries).toHaveLength(2);
		});
	});

	describe("maxSize", () => {
		it("should evict oldest entries when maxSize is exceeded", () => {
			const maxSizeCache = createCache({ maxSize: 2 });

			maxSizeCache.set("key1", "value1");
			maxSizeCache.set("key2", "value2");
			maxSizeCache.set("key3", "value3"); // Should evict key1

			expect(maxSizeCache.get("key1")).toBeUndefined();
			expect(maxSizeCache.get("key2")).toBe("value2");
			expect(maxSizeCache.get("key3")).toBe("value3");
		});
	});

	describe("ttl", () => {
		it("should expire entries after ttl", async () => {
			const ttlCache = createCache({ ttl: 10 }); // 10ms TTL

			ttlCache.set("key", "value");
			expect(ttlCache.get("key")).toBe("value");

			// Wait for expiration
			vi.advanceTimersByTime(20);

			expect(ttlCache.get("key")).toBeUndefined();
			expect(ttlCache.has("key")).toBe(false);
		});
	});

	describe("lru", () => {
		it("should evict least recently used entries when lru is enabled", () => {
			const lruCache = createCache({ maxSize: 2, lru: true });

			lruCache.set("key1", "value1");
			vi.advanceTimersByTime(1);
			lruCache.set("key2", "value2");

			// Access key1 to make it recently used
			vi.advanceTimersByTime(1);
			lruCache.get("key1");

			// Add key3, should evict key2 (least recently used)
			vi.advanceTimersByTime(1);
			lruCache.set("key3", "value3");

			expect(lruCache.get("key1")).toBe("value1");
			expect(lruCache.get("key2")).toBeUndefined();
			expect(lruCache.get("key3")).toBe("value3");
		});
	});

	describe("stats", () => {
		it("should track cache statistics", () => {
			const statsCache = createCache();

			// Initial stats
			let stats = statsCache.stats();
			expect(stats.hits).toBe(0);
			expect(stats.misses).toBe(0);
			expect(stats.evictions).toBe(0);
			expect(stats.size).toBe(0);

			// Add some entries
			statsCache.set("key1", "value1");
			statsCache.set("key2", "value2");

			stats = statsCache.stats();
			expect(stats.size).toBe(2);

			// Test hits and misses
			statsCache.get("key1"); // hit
			statsCache.get("key3"); // miss

			stats = statsCache.stats();
			expect(stats.hits).toBe(1);
			expect(stats.misses).toBe(1);
		});
	});
});
