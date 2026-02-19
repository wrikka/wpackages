/**
 * Tests for Result utility
 */

import { describe, expect, it } from "vitest";
import * as Result from "./result.util";

describe("Result utility", () => {
	describe("ok/err constructors", () => {
		it("should create Ok result", () => {
			const result = Result.ok(42);
			expect(result).toEqual({ ok: true, value: 42 });
		});

		it("should create Err result", () => {
			const result = Result.err("error");
			expect(result).toEqual({ ok: false, error: "error" });
		});
	});

	describe("type guards", () => {
		it("should identify Ok result", () => {
			const result = Result.ok(42);
			expect(Result.isOk(result)).toBe(true);
			expect(Result.isErr(result)).toBe(false);
		});

		it("should identify Err result", () => {
			const result = Result.err("error");
			expect(Result.isOk(result)).toBe(false);
			expect(Result.isErr(result)).toBe(true);
		});
	});

	describe("unwrap operations", () => {
		it("should unwrap Ok value", () => {
			const result = Result.ok(42);
			expect(Result.unwrap(result)).toBe(42);
		});

		it("should throw on unwrap Err", () => {
			const result = Result.err("error");
			expect(() => Result.unwrap(result)).toThrow("Attempted to unwrap an Err value");
		});

		it("should unwrap with default value", () => {
			const okResult = Result.ok(42);
			const errResult = Result.err("error");
			expect(Result.unwrapOr(okResult, 0)).toBe(42);
			expect(Result.unwrapOr(errResult, 0)).toBe(0);
		});
	});
});
