import { describe, expect, it } from "bun:test";
import { success, failure, isSuccess, isFailure, mapResult, foldResult } from "./utils/result";

describe("Result", () => {
	it("should create success", () => {
		const result = success(42);
		expect(isSuccess(result)).toBe(true);
		expect(result.value).toBe(42);
	});

	it("should create failure", () => {
		const result = failure({ message: "Error" });
		expect(isFailure(result)).toBe(true);
		expect(result.error).toEqual({ message: "Error" });
	});

	it("should map over success", () => {
		const result = success(42);
		const mapped = mapResult((x: number) => x * 2)(result);
		expect(isSuccess(mapped)).toBe(true);
		expect(mapped.value).toBe(84);
	});

	it("should fold over result", () => {
		const successResult = success(42);
		const failureResult = failure({ message: "Error" });

		const successFolded = foldResult(
			(e: any) => `Error: ${e.message}`,
			(x: number) => `Success: ${x}`,
		)(successResult);
		expect(successFolded).toBe("Success: 42");

		const failureFolded = foldResult(
			(e: any) => `Error: ${e.message}`,
			(x: number) => `Success: ${x}`,
		)(failureResult);
		expect(failureFolded).toBe("Error: Error");
	});
});
