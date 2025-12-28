import { describe, expect, it } from "vitest";
import * as Result from "./result.util";

describe("Result utilities", () => {
	it("should create Ok value", () => {
		const result = Result.ok(42);
		expect(Result.isOk(result)).toBe(true);
		expect(Result.unwrap(result)).toBe(42);
	});

	it("should create Err value", () => {
		const result = Result.err("error");
		expect(Result.isErr(result)).toBe(true);
		expect(Result.unwrapErr(result)).toBe("error");
	});

	it("should map Ok value", () => {
		const result = Result.ok(10);
		const mapped = Result.map(result, (x) => x * 2);
		expect(Result.unwrap(mapped)).toBe(20);
	});

	it("should not map Err value", () => {
		const result: Result.Result<number, string> = Result.err<number, string>(
			"error",
		);
		const mapped = Result.map(result, (x) => x * 2);
		expect(Result.isErr(mapped)).toBe(true);
	});

	it("should flatMap Ok value", () => {
		const result = Result.ok(10);
		const flatMapped = Result.flatMap(result, (x) => Result.ok(x * 2));
		expect(Result.unwrap(flatMapped)).toBe(20);
	});

	it("should unwrapOr with default value", () => {
		const errResult: Result.Result<number, string> = Result.err<number, string>(
			"error",
		);
		expect(Result.unwrapOr(errResult, 0)).toBe(0);

		const okResult = Result.ok(42);
		expect(Result.unwrapOr(okResult, 0)).toBe(42);
	});
});
