import { describe, expect, it } from "vitest";
import { createSemaphore } from "./semaphore";

describe("Semaphore", () => {
	it("should allow acquiring and releasing permits", async () => {
		const semaphore = createSemaphore(2);

		// Acquire first permit
		await semaphore.acquire();

		// Acquire second permit
		await semaphore.acquire();

		// Third acquire should block until release
		let resolved = false;
		semaphore.acquire().then(() => {
			resolved = true;
		});

		// Release one permit
		semaphore.release();

		// Wait a bit for the promise to resolve
		await new Promise(resolve => setTimeout(resolve, 10));

		expect(resolved).toBe(true);

		// Clean up
		semaphore.release();
		semaphore.release();
	});

	it("should run exclusive functions correctly", async () => {
		const semaphore = createSemaphore(1);
		let counter = 0;

		const results = await Promise.all([
			semaphore.runExclusive(async () => {
				await new Promise(resolve => setTimeout(resolve, 10));
				return ++counter;
			}),
			semaphore.runExclusive(async () => {
				await new Promise(resolve => setTimeout(resolve, 5));
				return ++counter;
			}),
		]);

		expect(results).toEqual([1, 2]);
		expect(counter).toBe(2);
	});

	it("should handle multiple permits", async () => {
		const semaphore = createSemaphore(3);

		// Acquire 2 permits
		await semaphore.acquire(2);

		// Try to acquire 2 more (should block)
		let resolved = false;
		semaphore.acquire(2).then(() => {
			resolved = true;
		});

		// Release 1 permit
		semaphore.release(1);

		// Wait a bit for the promise to resolve
		await new Promise(resolve => setTimeout(resolve, 10));

		expect(resolved).toBe(true);

		// Clean up
		semaphore.release(2);
		semaphore.release(2);
	});

	it("should throw error for invalid maxConcurrency", () => {
		expect(() => createSemaphore(0)).toThrow("Max concurrency must be greater than 0");
		expect(() => createSemaphore(-1)).toThrow("Max concurrency must be greater than 0");
	});

	it("should throw error for acquiring too many permits", () => {
		const semaphore = createSemaphore(2);
		expect(() => semaphore.acquire(3)).toThrow("Cannot acquire 3 permits when max concurrency is 2");
	});
});
