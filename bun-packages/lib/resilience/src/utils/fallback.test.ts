import { describe, expect, it } from "vitest";
import type { ResilienceFunction } from "../types";
import { withFallback } from "./fallback";
import { createFailure, createSuccess } from "./result";

describe("fallback utils", () => {
	describe("withFallback", () => {
		it("should return success result when primary function succeeds", async () => {
			const primary: ResilienceFunction<number> = async () => createSuccess(42);
			const fallback = async () => 0;

			const wrapped = withFallback(primary, fallback);
			const result = await wrapped();

			expect(result.success).toBe(true);
			expect((result as any).data).toBe(42);
		});

		it("should use fallback when primary function fails", async () => {
			const primary: ResilienceFunction<number> = async () => createFailure<number>(new Error("Primary failed"));
			const fallback = async () => 99;

			const wrapped = withFallback(primary, fallback);
			const result = await wrapped();

			expect(result.success).toBe(true);
			expect((result as any).data).toBe(99);
		});

		it("should return failure when both primary and fallback fail", async () => {
			const primary: ResilienceFunction<number> = async () => createFailure<number>(new Error("Primary failed"));
			const fallback = async () => {
				throw new Error("Fallback failed");
			};

			const wrapped = withFallback(primary, fallback);
			const result = await wrapped();

			expect(result.success).toBe(false);
			expect((result as any).error.message).toBe("Fallback failed");
		});

		it("should handle thrown errors from primary function", async () => {
			const primary: ResilienceFunction<number> = async () => {
				throw new Error("Primary threw");
			};
			const fallback = async () => 50;

			const wrapped = withFallback(primary, fallback);
			const result = await wrapped();

			expect(result.success).toBe(true);
			expect((result as any).data).toBe(50);
		});

		it("should pass arguments to primary function", async () => {
			let receivedArg: number | undefined;

			const primary: ResilienceFunction<number, [number]> = async (
				arg: number,
			) => {
				receivedArg = arg;
				return createSuccess(arg * 2);
			};
			const fallback = async () => 0;

			const wrapped = withFallback(primary, fallback);
			const result = await wrapped(5);

			expect(receivedArg).toBe(5);
			expect((result as any).data).toBe(10);
		});
	});
});
