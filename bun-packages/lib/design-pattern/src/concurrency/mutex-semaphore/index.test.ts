import { describe, expect, it, spyOn } from "bun:test";
import { Semaphore } from "./index";

describe("Semaphore Pattern", () => {
	it("should limit concurrency to the specified number of permits", async () => {
		const semaphore = new Semaphore(2); // Limit to 2 concurrent tasks
		let running = 0;
		let maxRunning = 0;

		const task = async () => {
			await semaphore.acquire();
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
			running--;
			semaphore.release();
		};

		const tasks = Array.from({ length: 5 }, () => task());
		await Promise.all(tasks);

		expect(maxRunning).toBe(2);
	});

	it("withLock should automatically acquire and release", async () => {
		const semaphore = new Semaphore(1); // Mutex behavior
		const acquireSpy = spyOn(semaphore, "acquire");
		const releaseSpy = spyOn(semaphore, "release");

		const result = await semaphore.withLock(async () => {
			return "test";
		});

		expect(result).toBe("test");
		expect(acquireSpy).toHaveBeenCalled();
		expect(releaseSpy).toHaveBeenCalled();
	});
});
