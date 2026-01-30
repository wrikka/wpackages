import { describe, expect, it } from "vitest";
import { mapReduce, parallelMap, parallelReduce } from "./map-reduce";

describe("map-reduce", () => {
	describe("mapReduce", () => {
		it("should map and reduce data", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await mapReduce(data, {
				mapper: (x) => x * 2,
				reducer: (acc, curr) => acc + curr,
				initialValue: 0,
			});
			expect(result).toBe(30);
		});

		it("should work with async mapper", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await mapReduce(data, {
				mapper: async (x) => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					return x * 2;
				},
				reducer: (acc, curr) => acc + curr,
				initialValue: 0,
			});
			expect(result).toBe(30);
		});

		it("should work with async reducer", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await mapReduce(data, {
				mapper: (x) => x * 2,
				reducer: async (acc, curr) => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					return acc + curr;
				},
				initialValue: 0,
			});
			expect(result).toBe(30);
		});
	});

	describe("parallelMap", () => {
		it("should map data in parallel", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await parallelMap(data, (x) => x * 2);
			expect(result).toEqual([2, 4, 6, 8, 10]);
		});

		it("should work with async mapper", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await parallelMap(data, async (x) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return x * 2;
			});
			expect(result).toEqual([2, 4, 6, 8, 10]);
		});

		it("should handle empty array", async () => {
			const result = await parallelMap([], (x) => x * 2);
			expect(result).toEqual([]);
		});
	});

	describe("parallelReduce", () => {
		it("should reduce data in parallel", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await parallelReduce(data, (acc, curr) => acc + curr, 0);
			expect(result).toBe(15);
		});

		it("should work with async reducer", async () => {
			const data = [1, 2, 3, 4, 5];
			const result = await parallelReduce(data, async (acc, curr) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return acc + curr;
			}, 0);
			expect(result).toBe(15);
		});

		it("should handle empty array", async () => {
			const result = await parallelReduce([], (acc, curr) => acc + curr, 0);
			expect(result).toBe(0);
		});
	});
});
