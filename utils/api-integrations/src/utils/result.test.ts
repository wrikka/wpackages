import { describe, expect, it } from "vitest";
import { combine, err, flatMap, getOrElse, isErr, isOk, map, ok, Result, unwrap } from "./result";

describe("result", () => {
	describe("ok and err", () => {
		it("should create Ok result", () => {
			const result = ok(42);
			expect(result.success).toBe(true);
			expect(result.value).toBe(42);
		});

		it("should create Err result", () => {
			const result = err("error");
			expect(result.success).toBe(false);
			expect(result.error).toBe("error");
		});
	});

	describe("isOk and isErr", () => {
		it("should check if result is Ok", () => {
			expect(isOk(ok(42))).toBe(true);
			expect(isOk(err("error"))).toBe(false);
		});

		it("should check if result is Err", () => {
			expect(isErr(err("error"))).toBe(true);
			expect(isErr(ok(42))).toBe(false);
		});
	});

	describe("map", () => {
		it("should map over Ok value", () => {
			const result = map(ok(21), (x) => x * 2);
			expect(isOk(result) && result.value).toBe(42);
		});

		it("should not map over Err", () => {
			const result = map(err("error"), (x: number) => x * 2);
			expect(isErr(result) && result.error).toBe("error");
		});
	});

	describe("flatMap", () => {
		it("should chain Ok results", () => {
			const result = flatMap(ok(21), (x) => ok(x * 2));
			expect(isOk(result) && result.value).toBe(42);
		});

		it("should not chain Err", () => {
			const result = flatMap(err("error"), (x: number) => ok(x * 2));
			expect(isErr(result)).toBe(true);
		});
	});

	describe("getOrElse", () => {
		it("should return value for Ok", () => {
			expect(getOrElse(ok(42), 0)).toBe(42);
		});

		it("should return default for Err", () => {
			expect(getOrElse(err("error"), 0)).toBe(0);
		});
	});

	describe("unwrap", () => {
		it("should unwrap Ok value", () => {
			expect(unwrap(ok(42))).toBe(42);
		});

		it("should throw for Err", () => {
			expect(() => unwrap(err("error"))).toThrow("error");
		});
	});

	describe("combine", () => {
		it("should combine all Ok results", () => {
			const results = [ok(1), ok(2), ok(3)];
			const combined = combine(results);
			expect(isOk(combined) && combined.value).toEqual([1, 2, 3]);
		});

		it("should return first Err", () => {
			const results = [ok(1), err("error"), ok(3)];
			const combined = combine(results);
			expect(isErr(combined) && combined.error).toBe("error");
		});
	});

	describe("Result namespace", () => {
		it("should provide all functions", () => {
			expect(Result.ok).toBeDefined();
			expect(Result.err).toBeDefined();
			expect(Result.isOk).toBeDefined();
			expect(Result.map).toBeDefined();
		});
	});
});
