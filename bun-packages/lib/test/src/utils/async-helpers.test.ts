import { describe, expect, it } from "../index";
import { delay, retry, waitFor, withTimeout } from "./async-helpers";

describe("Async helpers", () => {
	describe("delay", () => {
		it("should delay execution", async () => {
			const start = Date.now();
			await delay(100);
			const duration = Date.now() - start;
			expect(duration >= 100).toBeTruthy();
		});
	});

	describe("waitFor", () => {
		it("should wait for condition", async () => {
			let value = 0;
			setTimeout(() => {
				value = 42;
			}, 50);
			await waitFor(() => value === 42, 1000);
			expect(value).toBe(42);
		});

		it("should timeout if condition not met", async () => {
			try {
				await waitFor(() => false, 100);
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof Error) {
					expect(error.message).toContainString("Timeout");
				} else {
					throw error;
				}
			}
		});
	});

	describe("retry", () => {
		it("should retry on failure", async () => {
			let attempts = 0;
			const result = await retry(
				async () => {
					attempts++;
					if (attempts < 3) {
						throw new Error("Not yet");
					}
					return 42;
				},
				5,
				10,
			);
			expect(result).toBe(42);
			expect(attempts).toBe(3);
		});

		it("should throw after max attempts", async () => {
			try {
				await retry(
					async () => {
						throw new Error("Always fails");
					},
					3,
					10,
				);
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof Error) {
					expect(error.message).toContainString("Always fails");
				} else {
					throw error;
				}
			}
		});
	});

	describe("withTimeout", () => {
		it("should resolve if promise completes in time", async () => {
			const result = await withTimeout(
				Promise.resolve(42),
				1000,
			);
			expect(result).toBe(42);
		});

		it("should timeout if promise takes too long", async () => {
			try {
				await withTimeout(
					new Promise((resolve) => setTimeout(() => resolve(42), 1000)),
					100,
				);
				throw new Error("Should have thrown");
			} catch (error) {
				if (error instanceof Error) {
					expect(error.message).toContainString("Timeout");
				} else {
					throw error;
				}
			}
		});
	});
});
