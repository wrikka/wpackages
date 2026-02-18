import { describe, expect, it } from "vitest";
import { parallel, series, waterfall } from "./parallel";

describe("parallel", () => {
	it("should run all tasks in parallel when concurrency is unlimited", async () => {
		const results = await parallel([
			() => Promise.resolve(1),
			() => Promise.resolve(2),
			() => Promise.resolve(3),
		]);
		expect(results).toEqual([1, 2, 3]);
	});

	it("should respect concurrency limit", async () => {
		const order: number[] = [];
		const results = await parallel(
			[
				() => new Promise((r) => setTimeout(() => (order.push(1), r(1)), 30)),
				() => new Promise((r) => setTimeout(() => (order.push(2), r(2)), 20)),
				() => new Promise((r) => setTimeout(() => (order.push(3), r(3)), 10)),
			],
			{ concurrency: 1 },
		);
		expect(results).toEqual([1, 2, 3]);
		expect(order).toEqual([1, 2, 3]);
	});

	it("should reject on first error", async () => {
		await expect(
			parallel([
				() => Promise.resolve(1),
				() => Promise.reject(new Error("fail")),
				() => Promise.resolve(3),
			]),
		).rejects.toThrow("fail");
	});
});

describe("series", () => {
	it("should run tasks in sequence", async () => {
		const order: number[] = [];
		const results = await series([
			() => (order.push(1), Promise.resolve(1)),
			() => (order.push(2), Promise.resolve(2)),
			() => (order.push(3), Promise.resolve(3)),
		]);
		expect(results).toEqual([1, 2, 3]);
		expect(order).toEqual([1, 2, 3]);
	});
});

describe("waterfall", () => {
	it("should pass results through chain", async () => {
		const result = await waterfall(1, [
			(x) => x * 2,
			(x) => x + 1,
			(x) => Promise.resolve(x * 3),
		]);
		expect(result).toBe(9); // ((1 * 2) + 1) * 3
	});
});
