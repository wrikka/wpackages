import { describe, expect, it, vi } from "vitest";
import { firstSuccess, parallel, parallelCollect } from "./parallel";

describe("Parallel Utilities", () => {
	describe("parallel", () => {
		it("should execute all functions in parallel", async () => {
			const fn1 = vi.fn(async () => "result1");
			const fn2 = vi.fn(async () => "result2");
			const fn3 = vi.fn(async () => "result3");

			const results = await parallel([fn1, fn2, fn3]);

			expect(results).toHaveLength(3);
			expect(results[0]).toEqual({ success: true, value: "result1" });
			expect(results[1]).toEqual({ success: true, value: "result2" });
			expect(results[2]).toEqual({ success: true, value: "result3" });

			expect(fn1).toHaveBeenCalled();
			expect(fn2).toHaveBeenCalled();
			expect(fn3).toHaveBeenCalled();
		});

		it("should handle failed functions", async () => {
			const fn1 = vi.fn(async () => "result1");
			const fn2 = vi.fn(async () => {
				throw new Error("fail");
			});
			const fn3 = vi.fn(async () => "result3");

			const results = await parallel([fn1, fn2, fn3]);

			expect(results).toHaveLength(3);
			expect(results[0]).toEqual({ success: true, value: "result1" });
			expect(results[1]).toEqual({ success: false, error: expect.any(Error) });
			expect(results[2]).toEqual({ success: true, value: "result3" });
		});

		it("should respect concurrency limit", async () => {
			const fn1 = vi.fn(async () => {
				await new Promise(resolve => setTimeout(resolve, 50));
				return "result1";
			});
			const fn2 = vi.fn(async () => {
				await new Promise(resolve => setTimeout(resolve, 30));
				return "result2";
			});
			const fn3 = vi.fn(async () => {
				await new Promise(resolve => setTimeout(resolve, 20));
				return "result3";
			});

			const start = Date.now();
			const results = await parallel([fn1, fn2, fn3], { concurrency: 1 });
			const end = Date.now();

			expect(results).toHaveLength(3);
			// Should take longer since functions run sequentially
			expect(end - start).toBeGreaterThanOrEqual(85);
		});

		it("should fail fast when option is enabled", async () => {
			const fn1 = vi.fn(async () => "result1");
			const fn2 = vi.fn(async () => {
				throw new Error("fail");
			});
			const fn3 = vi.fn(async () => "result3");

			await expect(parallel([fn1, fn2, fn3], { failFast: true }))
				.rejects.toThrow("fail");
		});
	});

	describe("parallelCollect", () => {
		it("should collect successful results and errors separately", async () => {
			const fn1 = vi.fn(async () => "result1");
			const fn2 = vi.fn(async () => {
				throw new Error("error1");
			});
			const fn3 = vi.fn(async () => "result3");
			const fn4 = vi.fn(async () => {
				throw new Error("error2");
			});

			const { success, errors } = await parallelCollect([fn1, fn2, fn3, fn4]);

			expect(success).toEqual(["result1", "result3"]);
			expect(errors).toHaveLength(2);
			expect(errors[0]).toBeInstanceOf(Error);
			expect(errors[1]).toBeInstanceOf(Error);
		});
	});

	describe("firstSuccess", () => {
		it("should return the first successful result", async () => {
			const fn1 = vi.fn(async () => {
				throw new Error("fail1");
			});
			const fn2 = vi.fn(async () => "success");
			const fn3 = vi.fn(async () => {
				throw new Error("fail2");
			});

			const result = await firstSuccess([fn1, fn2, fn3]);

			expect(result).toBe("success");
			expect(fn1).toHaveBeenCalled();
			expect(fn2).toHaveBeenCalled();
			// fn3 might not be called depending on timing
		});

		it("should throw if all functions fail", async () => {
			const fn1 = vi.fn(async () => {
				throw new Error("fail1");
			});
			const fn2 = vi.fn(async () => {
				throw new Error("fail2");
			});

			await expect(firstSuccess([fn1, fn2]))
				.rejects.toThrow("fail1"); // Should throw the first error
		});
	});
});
