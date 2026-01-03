import { describe, expect, it } from "vitest";
import { isEmail, isNumber, isUrl } from "./validation.utils";

describe("validation.utils", () => {
	describe("isEmail", () => {
		it("should validate correct email addresses", () => {
			expect(isEmail("test@example.com")).toBe(true);
			expect(isEmail("user.name@domain.co.uk")).toBe(true);
			expect(isEmail("user+tag@example.com")).toBe(true);
		});

		it("should reject invalid email addresses", () => {
			expect(isEmail("invalid")).toBe(false);
			expect(isEmail("@example.com")).toBe(false);
			expect(isEmail("user@")).toBe(false);
			expect(isEmail("user@domain")).toBe(false);
			expect(isEmail("user domain@example.com")).toBe(false);
		});

		it("should handle edge cases", () => {
			expect(isEmail("")).toBe(false);
			expect(isEmail(" ")).toBe(false);
			expect(isEmail("a@b.c")).toBe(true);
		});
	});

	describe("isUrl", () => {
		it("should validate correct URLs", () => {
			expect(isUrl("https://example.com")).toBe(true);
			expect(isUrl("http://localhost:3000")).toBe(true);
			expect(isUrl("https://example.com/path?query=value")).toBe(true);
			expect(isUrl("ftp://files.example.com")).toBe(true);
		});

		it("should reject invalid URLs", () => {
			expect(isUrl("invalid")).toBe(false);
			expect(isUrl("not a url")).toBe(false);
			expect(isUrl("http://")).toBe(false);
		});

		it("should handle edge cases", () => {
			expect(isUrl("")).toBe(false);
			expect(isUrl(" ")).toBe(false);
			expect(isUrl("example.com")).toBe(false);
		});

		it("should support various protocols", () => {
			expect(isUrl("https://example.com")).toBe(true);
			expect(isUrl("http://example.com")).toBe(true);
			expect(isUrl("ws://example.com")).toBe(true);
			expect(isUrl("wss://example.com")).toBe(true);
		});
	});

	describe("isNumber", () => {
		it("should validate numbers", () => {
			expect(isNumber(0)).toBe(true);
			expect(isNumber(42)).toBe(true);
			expect(isNumber(-10)).toBe(true);
			expect(isNumber(3.14)).toBe(true);
			expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
			expect(isNumber(Number.NEGATIVE_INFINITY)).toBe(true);
		});

		it("should reject non-numbers", () => {
			expect(isNumber("42")).toBe(false);
			expect(isNumber("not a number")).toBe(false);
			expect(isNumber(null)).toBe(false);
			expect(isNumber(undefined)).toBe(false);
			expect(isNumber({})).toBe(false);
			expect(isNumber([])).toBe(false);
		});

		it("should reject NaN", () => {
			expect(isNumber(Number.NaN)).toBe(false);
		});
	});
});
