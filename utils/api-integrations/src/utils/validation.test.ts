import { describe, expect, it } from "vitest";
import {
	validateEmail,
	validateEnum,
	validateLength,
	validateRange,
	validateRequired,
	validateUrl,
} from "./validation";

describe("validation utils", () => {
	describe("validateRequired", () => {
		it("should pass when all required fields are present", () => {
			const data = { email: "john@example.com", name: "John" };
			const result = validateRequired(data, ["name", "email"]);
			expect(result.ok).toBe(true);
		});

		it("should fail when required fields are missing", () => {
			const data = { name: "John", email: "" };
			const result = validateRequired(data, ["name", "email"] as const);
			expect(result.ok).toBe(false);
			const errResult = result as { ok: false; error: { type: string; message: string } };
			expect(errResult.error.type).toBe("validation");
			expect(errResult.error.message).toContain("email");
		});

		it("should fail when field is empty string", () => {
			const data = { name: "" };
			const result = validateRequired(data, ["name"]);
			expect(result.ok).toBe(false);
		});
	});

	describe("validateUrl", () => {
		it("should pass for valid URLs", () => {
			const result = validateUrl("https://example.com");
			expect(result.ok).toBe(true);
		});

		it("should fail for invalid URLs", () => {
			const result = validateUrl("not a url");
			expect(result.ok).toBe(false);
			const errResult = result as { ok: false; error: { type: string } };
			expect(errResult.error.type).toBe("validation");
		});
	});

	describe("validateEmail", () => {
		it("should pass for valid emails", () => {
			const result = validateEmail("user@example.com");
			expect(result.ok).toBe(true);
		});

		it("should fail for invalid emails", () => {
			const result = validateEmail("not-an-email");
			expect(result.ok).toBe(false);
			const errResult = result as { ok: false; error: { type: string } };
			expect(errResult.error.type).toBe("validation");
		});
	});

	describe("validateLength", () => {
		it("should pass when length is within range", () => {
			const result = validateLength("hello", 3, 10);
			expect(result.ok).toBe(true);
		});

		it("should fail when length is too short", () => {
			const result = validateLength("hi", 3, 10);
			expect(result.ok).toBe(false);
		});

		it("should fail when length is too long", () => {
			const result = validateLength("hello world!!!", 3, 10);
			expect(result.ok).toBe(false);
		});
	});

	describe("validateRange", () => {
		it("should pass when value is within range", () => {
			const result = validateRange(5, 1, 10);
			expect(result.ok).toBe(true);
		});

		it("should fail when value is below minimum", () => {
			const result = validateRange(0, 1, 10);
			expect(result.ok).toBe(false);
		});

		it("should fail when value is above maximum", () => {
			const result = validateRange(11, 1, 10);
			expect(result.ok).toBe(false);
		});
	});

	describe("validateEnum", () => {
		it("should pass when value is in allowed list", () => {
			const result = validateEnum("read", ["read", "write", "delete"] as const);
			expect(result.ok).toBe(true);
		});

		it("should fail when value is not in allowed list", () => {
			const result = validateEnum("invalid", ["read", "write"] as const);
			expect(result.ok).toBe(false);
		});
	});
});
