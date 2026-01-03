import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import type { EmailNotification } from "../../src/types";
import { sanitizeContent, validateAndSanitize } from "../../src/utils/validation";

describe("Validation - Sanitize", () => {
	describe("sanitizeContent", () => {
		it("should remove script tags", () => {
			const input = 'Hello <script>alert("xss")</script> World';
			const result = sanitizeContent(input);
			expect(result).toBe("Hello  World");
		});

		it("should remove iframe tags", () => {
			const input = 'Content <iframe src="evil.com"></iframe> here';
			const result = sanitizeContent(input);
			expect(result).toBe("Content  here");
		});

		it("should remove javascript: protocol", () => {
			const input = '<a href="javascript:alert(1)">Click</a>';
			const result = sanitizeContent(input);
			expect(result).toBe('<a href="alert(1)">Click</a>');
		});

		it("should remove event handlers", () => {
			const input = '<div onclick="alert(1)">Click me</div>';
			const result = sanitizeContent(input);
			expect(result).toBe("<div>Click me</div>");
		});

		it("should handle multiple dangerous elements", () => {
			const input = '<script>bad()</script><iframe src="x"></iframe><div onclick="y">text</div>';
			const result = sanitizeContent(input);
			expect(result).not.toContain("<script>");
			expect(result).not.toContain("<iframe>");
			expect(result).not.toContain("onclick");
		});

		it("should keep safe HTML", () => {
			const input = "<p>Hello <strong>World</strong></p>";
			const result = sanitizeContent(input);
			expect(result).toBe("<p>Hello <strong>World</strong></p>");
		});

		it("should handle empty string", () => {
			const result = sanitizeContent("");
			expect(result).toBe("");
		});
	});

	describe("validateAndSanitize", () => {
		it("should validate and sanitize email notification", async () => {
			const notification: EmailNotification = {
				channel: "email",
				to: "test@example.com",
				subject: 'Test <script>alert("xss")</script>',
				body: 'Hello <iframe src="evil.com"></iframe> World',
			};

			const result = await Effect.runPromise(
				validateAndSanitize(notification),
			);

			expect(result.subject).not.toContain("<script>");
			expect(result.body).not.toContain("<iframe>");
		});

		it("should fail validation for invalid notification", async () => {
			const notification: EmailNotification = {
				channel: "email",
				to: "invalid-email",
				subject: "Test",
				body: "Hello",
			};

			const result = await Effect.runPromise(
				Effect.either(validateAndSanitize(notification)),
			);

			expect(result._tag).toBe("Left");
		});

		it("should handle notification without subject", async () => {
			const notification: EmailNotification = {
				channel: "email",
				to: "test@example.com",
				body: "Hello <script>bad()</script>",
			};

			const result = await Effect.runPromise(
				validateAndSanitize(notification),
			);

			expect(result.subject).toBeUndefined();
			expect(result.body).not.toContain("<script>");
		});
	});
});
