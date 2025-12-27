import { describe, expect, it, vi } from "vitest";
import { TimeoutError } from "../errors";
import { createTimeoutConfig, delay, race, raceAll, timeout, withDeadline, withTimeout } from "./timeout";

describe("timeout service", () => {
	describe("withTimeout", () => {
		it("should complete successfully within timeout", async () => {
			const fn = async () => {
				await delay(50);
				return "success";
			};

			const result = await withTimeout(fn, { duration: 200 });
			expect(result).toBe("success");
		});

		it("should throw TimeoutError when exceeding timeout", async () => {
			const fn = async () => {
				await delay(200);
				return "success";
			};

			await expect(withTimeout(fn, { duration: 50 })).rejects.toThrow(TimeoutError);
		});

		it("should call onTimeout callback", async () => {
			const onTimeout = vi.fn();
			const fn = async () => {
				await delay(200);
				return "success";
			};

			try {
				await withTimeout(fn, { duration: 50, onTimeout });
			} catch {
				// Expected
			}

			expect(onTimeout).toHaveBeenCalled();
		});

		it("should respect AbortSignal", async () => {
			const controller = new AbortController();
			const fn = async () => {
				await delay(200);
				return "success";
			};

			setTimeout(() => controller.abort(), 50);

			await expect(
				withTimeout(fn, { duration: 500, signal: controller.signal }),
			).rejects.toThrow(TimeoutError);
		});
	});

	describe("timeout", () => {
		it("should return success result within timeout", async () => {
			const fn = async () => {
				await delay(50);
				return "success";
			};

			const result = await timeout(fn, { duration: 200 });
			expect(result.success).toBe(true);
			expect((result as any).value).toBe("success");
			expect(result.duration).toBeGreaterThanOrEqual(40);
		});

		it("should return failure result on timeout", async () => {
			const fn = async () => {
				await delay(200);
				return "success";
			};

			const result = await timeout(fn, { duration: 50 });
			expect(result.success).toBe(false);
			expect((result as any).error).toBeInstanceOf(TimeoutError);
			expect(result.duration).toBeGreaterThanOrEqual(50);
		});

		it("should call cleanup function on timeout", async () => {
			const cleanup = vi.fn();
			const fn = async () => {
				await delay(200);
				return "success";
			};

			const result = await timeout(fn, { duration: 50, cleanup });
			expect(result.success).toBe(false);
			expect(cleanup).toHaveBeenCalled();
		});

		it("should call onTimeout callback", async () => {
			const onTimeout = vi.fn();
			const fn = async () => {
				await delay(200);
				return "success";
			};

			await timeout(fn, { duration: 50, onTimeout });
			expect(onTimeout).toHaveBeenCalled();
		});
	});

	describe("delay", () => {
		it("should delay for specified duration", async () => {
			const start = Date.now();
			await delay(100);
			const duration = Date.now() - start;

			expect(duration).toBeGreaterThanOrEqual(90);
			expect(duration).toBeLessThan(250);
		});

		it("should resolve with undefined", async () => {
			const result = await delay(10);
			expect(result).toBeUndefined();
		});
	});

	describe("race", () => {
		it("should return first completed promise", async () => {
			const promises = [
				delay(100).then(() => "first"),
				delay(50).then(() => "second"),
				delay(150).then(() => "third"),
			];

			const result = await race(promises, 500);
			expect(result).toBe("second");
		});

		it("should throw TimeoutError when all promises exceed timeout", async () => {
			const promises = [
				delay(200).then(() => "first"),
				delay(300).then(() => "second"),
			];

			await expect(race(promises, 50)).rejects.toThrow(TimeoutError);
		});
	});

	describe("raceAll", () => {
		it("should return all successful promises within timeout", async () => {
			const promises = [
				delay(100).then(() => "first"),
				delay(200).then(() => "second"),
				delay(150).then(() => "third"),
			];

			const result = await raceAll(promises, 500);
			expect(result).toContain("first");
			expect(result).toContain("second");
			expect(result).toContain("third");
		});

		it("should throw TimeoutError when all promises timeout", async () => {
			const promises = [
				delay(200).then(() => "first"),
				delay(300).then(() => "second"),
			];

			await expect(raceAll(promises, 50)).rejects.toThrow(TimeoutError);
		});

		it("should return partial results if some succeed", async () => {
			const promises = [
				delay(50).then(() => "first"),
				delay(200).then(() => "second"),
				delay(75).then(() => "third"),
			];

			// raceAll returns partial results if some complete within timeout
			const result = await raceAll(promises, 100);
			expect(result.length).toBeGreaterThan(0);
			expect(result.length).toBeLessThanOrEqual(3);
		});
	});

	describe("withDeadline", () => {
		it("should complete before deadline", async () => {
			const deadline = new Date(Date.now() + 500);
			const fn = async () => {
				await delay(100);
				return "success";
			};

			const result = await withDeadline(fn, deadline);
			expect(result).toBe("success");
		});

		it("should throw TimeoutError when deadline passed", async () => {
			const deadline = new Date(Date.now() - 100);
			const fn = async () => "success";

			await expect(withDeadline(fn, deadline)).rejects.toThrow(TimeoutError);
		});

		it("should throw TimeoutError when exceeding deadline", async () => {
			const deadline = new Date(Date.now() + 50);
			const fn = async () => {
				await delay(200);
				return "success";
			};

			await expect(withDeadline(fn, deadline)).rejects.toThrow(TimeoutError);
		});
	});

	describe("createTimeoutConfig", () => {
		it("should create config with defaults", () => {
			const config = createTimeoutConfig({});
			expect(config.duration).toBe(30000);
			expect(config.signal).toBeUndefined();
			expect(config.onTimeout).toBeUndefined();
		});

		it("should merge user config with defaults", () => {
			const onTimeout = vi.fn();
			const config = createTimeoutConfig({
				duration: 5000,
				onTimeout,
			});

			expect(config.duration).toBe(5000);
			expect(config.onTimeout).toBe(onTimeout);
		});
	});

	describe("TimeoutError", () => {
		it("should be an instance of Error", () => {
			const error = new TimeoutError("Custom message");
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe("Custom message");
			expect(error.name).toBe("TimeoutError");
		});

		it("should have default message", () => {
			const error = new TimeoutError();
			expect(error.message).toBe("Operation timed out");
		});

		it("should have isTimeout flag", () => {
			const error = new TimeoutError();
			expect(error.isTimeout).toBe(true);
		});
	});
});
