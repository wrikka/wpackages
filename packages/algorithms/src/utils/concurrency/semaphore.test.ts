import { describe, expect, it, vi, beforeEach } from "vitest";
import { Semaphore } from "./semaphore";

describe("Semaphore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should limit concurrent executions", async () => {
		const semaphore = new Semaphore(2);
		let running = 0;
		let maxRunning = 0;

		const task = async (): Promise<void> => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 100));
			running--;
		};

		const tasks = [task(), task(), task(), task()];
		await Promise.all(tasks);

		expect(maxRunning).toBe(2);
	});
});
