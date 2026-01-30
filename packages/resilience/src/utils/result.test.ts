import { describe, expect, it } from "vitest";
import { chain, createFailure, createSuccess, getOrElse, getOrThrow, isFailure, isSuccess, map } from "./result";

describe("result utils", () => {
	describe("createSuccess", () => {
		it("should create a successful result", () => {
			const result = createSuccess(42);
			expect(result.success).toBe(true);
			expect(result.data).toBe(42);
			expect(result.metadata?.attempts).toBe(1);
			expect(result.metadata?.duration).toBe(0);
		});
	});

	describe("createFailure", () => {
		it("should create a failed result", () => {
			const error = new Error("Test error");
			const result = createFailure<number>(error, 3, 1000);
			expect(result.success).toBe(false);
			expect(result.error).toBe(error);
			expect(result.metadata?.attempts).toBe(3);
			expect(result.metadata?.duration).toBe(1000);
		});
	});

	describe("map", () => {
		it("should map successful result", () => {
			const result = createSuccess(5);
			const mapped = map((x: number) => x * 2)(result);
			expect(isSuccess(mapped)).toBe(true);
			expect((mapped as any).data).toBe(10);
		});

		it("should not map failed result", () => {
			const error = new Error("Test error");
			const result = createFailure<number>(error);
			const mapped = map((x: number) => x * 2)(result);
			expect(isFailure(mapped)).toBe(true);
		});
	});

	describe("chain", () => {
		it("should chain successful results", async () => {
			const result = createSuccess(5);
			const chained = await chain((x: number) => Promise.resolve(createSuccess(x * 2)))(result);
			expect(isSuccess(chained)).toBe(true);
			expect((chained as any).data).toBe(10);
		});

		it("should not chain failed result", async () => {
			const error = new Error("Test error");
			const result = createFailure<number>(error);
			const chained = await chain((x: number) => Promise.resolve(createSuccess(x * 2)))(result);
			expect(isFailure(chained)).toBe(true);
		});
	});

	describe("isSuccess", () => {
		it("should return true for successful result", () => {
			const result = createSuccess(42);
			expect(isSuccess(result)).toBe(true);
		});

		it("should return false for failed result", () => {
			const result = createFailure<number>(new Error("Test"));
			expect(isSuccess(result)).toBe(false);
		});
	});

	describe("isFailure", () => {
		it("should return true for failed result", () => {
			const result = createFailure<number>(new Error("Test"));
			expect(isFailure(result)).toBe(true);
		});

		it("should return false for successful result", () => {
			const result = createSuccess(42);
			expect(isFailure(result)).toBe(false);
		});
	});

	describe("getOrElse", () => {
		it("should return data for successful result", () => {
			const result = createSuccess(42);
			expect(getOrElse(result, 0)).toBe(42);
		});

		it("should return default value for failed result", () => {
			const result = createFailure<number>(new Error("Test"));
			expect(getOrElse(result, 0)).toBe(0);
		});
	});

	describe("getOrThrow", () => {
		it("should return data for successful result", () => {
			const result = createSuccess(42);
			expect(getOrThrow(result)).toBe(42);
		});

		it("should throw error for failed result", () => {
			const error = new Error("Test error");
			const result = createFailure<number>(error);
			expect(() => getOrThrow(result)).toThrow("Test error");
		});
	});
});
