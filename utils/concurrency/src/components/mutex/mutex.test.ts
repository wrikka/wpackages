import { describe, expect, it, vi } from "vitest";
import { sleep } from "../async/sleep";
import { createMutex } from "./index";

describe("Mutex", () => {
	it("should allow a single operation to acquire and release", async () => {
		const mutex = createMutex();
		const fn = vi.fn();

		await mutex.acquire();
		fn();
		mutex.release();

		expect(fn).toHaveBeenCalledOnce();
	});

	it("should queue operations and execute them sequentially", async () => {
		const mutex = createMutex();
		const results: number[] = [];

		const op1 = async () => {
			await mutex.acquire();
			results.push(1);
			await sleep(10);
			results.push(2);
			mutex.release();
		};

		const op2 = async () => {
			await mutex.acquire();
			results.push(3);
			mutex.release();
		};

		// Do not await them, let them run concurrently
		op1();
		op2();

		await sleep(50); // Wait for both operations to complete

		expect(results).toEqual([1, 2, 3]);
	});

	it("should run exclusive function correctly", async () => {
		const mutex = createMutex();
		const results: number[] = [];

		const exclusiveFn = async (value: number, delay: number) => {
			return mutex.runExclusive(async () => {
				results.push(value);
				await sleep(delay);
				return value;
			});
		};

		const promise1 = exclusiveFn(1, 20);
		const promise2 = exclusiveFn(2, 10);

		const [res1, res2] = await Promise.all([promise1, promise2]);

		expect(res1).toBe(1);
		expect(res2).toBe(2);
		expect(results).toEqual([1, 2]);
	});

	it("should handle multiple concurrent requests for the lock", async () => {
		const mutex = createMutex();
		let counter = 0;

		const promises = Array(5)
			.fill(0)
			.map(async (_, _i) => {
				return mutex.runExclusive(async () => {
					const current = counter;
					await sleep(Math.random() * 10);
					counter = current + 1;
				});
			});

		await Promise.all(promises);

		expect(counter).toBe(5);
	});
});
