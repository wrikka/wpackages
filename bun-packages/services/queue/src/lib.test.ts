/**
 * Basic queue tests
 */

import { describe, expect, it } from "vitest";
import { createQueueItem, isItemReady, validateQueueOptions } from "./lib";
import { generateId, isPositiveNumber } from "./utils";

describe("Queue Library Functions", () => {
	describe("createQueueItem", () => {
		it("should create a queue item without delay", () => {
			const data = "test data";
			const item = createQueueItem(data);

			expect(item.data).toBe(data);
			expect(item.priority).toBe(2);
			expect(item.delay).toBe(0);
			expect(item.scheduledFor).toBeUndefined();
			expect(typeof item.id).toBe("string");
			expect(typeof item.createdAt).toBe("number");
		});

		it("should create a queue item with delay", () => {
			const data = "test data";
			const delay = 1000;
			const item = createQueueItem(data, 3, delay);

			expect(item.data).toBe(data);
			expect(item.priority).toBe(3);
			expect(item.delay).toBe(delay);
			expect(item.scheduledFor).toBeDefined();
			expect(item.scheduledFor!).toBeGreaterThan(Date.now());
		});

		it("should create a queue item with custom priority", () => {
			const data = "test data";
			const priority = 4;
			const item = createQueueItem(data, priority);

			expect(item.priority).toBe(priority);
		});
	});

	describe("validateQueueOptions", () => {
		it("should validate valid options", () => {
			expect(() => validateQueueOptions({})).not.toThrow();
			expect(() => validateQueueOptions({ maxSize: 10 })).not.toThrow();
			expect(() => validateQueueOptions({ concurrency: 5 })).not.toThrow();
		});

		it("should throw on invalid maxSize", () => {
			expect(() => validateQueueOptions({ maxSize: 0 })).toThrow("maxSize must be positive");
			expect(() => validateQueueOptions({ maxSize: -5 })).toThrow("maxSize must be positive");
		});

		it("should throw on invalid concurrency", () => {
			expect(() => validateQueueOptions({ concurrency: 0 })).toThrow("concurrency must be positive");
			expect(() => validateQueueOptions({ concurrency: -2 })).toThrow("concurrency must be positive");
		});
	});

	describe("isItemReady", () => {
		it("should return true for items without scheduled time", () => {
			const item = createQueueItem("test");
			expect(isItemReady(item)).toBe(true);
		});

		it("should return true for items whose scheduled time has passed", () => {
			const item = createQueueItem("test", 2, -1000); // Scheduled in the past
			expect(isItemReady(item)).toBe(true);
		});

		it("should return false for items scheduled in the future", () => {
			const item = createQueueItem("test", 2, 10000); // Scheduled in the future
			expect(isItemReady(item)).toBe(false);
		});
	});
});

describe("Utility Functions", () => {
	describe("generateId", () => {
		it("should generate unique IDs", () => {
			const id1 = generateId();
			const id2 = generateId();

			expect(typeof id1).toBe("string");
			expect(typeof id2).toBe("string");
			expect(id1).not.toBe(id2);
		});
	});

	describe("isPositiveNumber", () => {
		it("should return true for positive numbers", () => {
			expect(isPositiveNumber(1)).toBe(true);
			expect(isPositiveNumber(0.5)).toBe(true);
			expect(isPositiveNumber(100)).toBe(true);
		});

		it("should return false for non-positive numbers", () => {
			expect(isPositiveNumber(0)).toBe(false);
			expect(isPositiveNumber(-1)).toBe(false);
			expect(isPositiveNumber(-0.5)).toBe(false);
		});

		it("should return false for non-numbers", () => {
			expect(isPositiveNumber("1")).toBe(false);
			expect(isPositiveNumber(null)).toBe(false);
			expect(isPositiveNumber(undefined)).toBe(false);
			expect(isPositiveNumber({})).toBe(false);
		});
	});
});
