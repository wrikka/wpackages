import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import type { EmailNotification, InAppNotification, PushNotification, SmsNotification } from "../types";
import { NotificationError } from "../types";
import {
	sanitizeContent,
	validateAndSanitize,
	validateEmail,
	validateNotification,
	validatePhoneNumber,
} from "./validation";

describe("validation utilities", () => {
	describe("validateEmail", () => {
		it("should validate correct email", async () => {
			const result = await Effect.runPromise(validateEmail("test@example.com"));
			expect(result).toBe(true);
		});

		it("should validate email with subdomain", async () => {
			const result = await Effect.runPromise(
				validateEmail("user@mail.example.com"),
			);
			expect(result).toBe(true);
		});

		it("should fail on invalid email without @", async () => {
			const result = await Effect.runPromise(
				Effect.either(validateEmail("invalid-email")),
			);

			expect(result._tag).toBe("Left");
			const error = (result as { _tag: "Left"; left: NotificationError }).left;
			expect(error).toBeInstanceOf(NotificationError);
			expect(error.reason).toBe("InvalidRecipient");
		});

		it("should fail on invalid email without domain", async () => {
			const result = await Effect.runPromise(
				Effect.either(validateEmail("test@")),
			);

			expect(result._tag).toBe("Left");
		});

		it("should fail on empty email", async () => {
			const result = await Effect.runPromise(Effect.either(validateEmail("")));

			expect(result._tag).toBe("Left");
		});

		it("should fail on email with spaces", async () => {
			const result = await Effect.runPromise(
				Effect.either(validateEmail("test @example.com")),
			);

			expect(result._tag).toBe("Left");
		});
	});

	describe("validatePhoneNumber", () => {
		it("should validate international phone number", async () => {
			const result = await Effect.runPromise(validatePhoneNumber("+66812345678"));
			expect(result).toBe(true);
		});

		it("should validate US phone number", async () => {
			const result = await Effect.runPromise(validatePhoneNumber("+11234567890"));
			expect(result).toBe(true);
		});

		it("should fail on phone without country code", async () => {
			const result = await Effect.runPromise(
				Effect.either(validatePhoneNumber("0123456789")),
			);

			expect(result._tag).toBe("Left");
			const error = (result as { _tag: "Left"; left: NotificationError }).left;
			expect(error).toBeInstanceOf(NotificationError);
			expect(error.reason).toBe("InvalidRecipient");
		});

		it("should fail on phone with letters", async () => {
			const result = await Effect.runPromise(
				Effect.either(validatePhoneNumber("+66abc123456")),
			);

			expect(result._tag).toBe("Left");
			const error = (result as { _tag: "Left"; left: NotificationError }).left;
			expect(error).toBeInstanceOf(NotificationError);
			expect(error.reason).toBe("InvalidRecipient");
		});

		it("should fail on empty phone", async () => {
			const result = await Effect.runPromise(
				Effect.either(validatePhoneNumber("")),
			);

			expect(result._tag).toBe("Left");
		});

		it("should fail on phone with spaces", async () => {
			const result = await Effect.runPromise(
				Effect.either(validatePhoneNumber("+66 81 234 5678")),
			);

			expect(result._tag).toBe("Left");
		});
	});

	describe("validateNotification", () => {
		it("should validate email notification", async () => {
			const notification: EmailNotification = {
				channel: "email",
				to: "test@example.com",
				subject: "Test",
				body: "Test body",
			};

			const result = await Effect.runPromise(
				validateNotification(notification),
			);
			expect(result).toBe(true);
		});

		it("should validate email notification with multiple recipients", async () => {
			const notification: EmailNotification = {
				channel: "email",
				to: ["test1@example.com", "test2@example.com"],
				subject: "Test",
				body: "Test body",
			};

			const result = await Effect.runPromise(
				validateNotification(notification),
			);
			expect(result).toBe(true);
		});

		it("should fail email notification without body", async () => {
			const notification = {
				channel: "email" as const,
				to: "test@example.com",
				subject: "Test",
				body: "",
			};

			const result = await Effect.runPromise(
				Effect.either(validateNotification(notification as EmailNotification)),
			);

			expect(result._tag).toBe("Left");
		});

		it("should validate SMS notification", async () => {
			const notification: SmsNotification = {
				channel: "sms",
				to: "+66812345678",
				body: "Test SMS",
			};

			const result = await Effect.runPromise(
				validateNotification(notification),
			);
			expect(result).toBe(true);
		});

		it("should fail SMS notification with invalid phone", async () => {
			const notification: SmsNotification = {
				channel: "sms",
				to: "invalid-phone",
				body: "Test SMS",
			};

			const result = await Effect.runPromise(
				Effect.either(validateNotification(notification)),
			);

			expect(result._tag).toBe("Left");
		});

		it("should validate push notification", async () => {
			const notification: PushNotification = {
				channel: "push",
				to: "device-token",
				title: "Test Push",
				body: "Push body",
			};

			const result = await Effect.runPromise(
				validateNotification(notification),
			);
			expect(result).toBe(true);
		});

		it("should fail push notification without title", async () => {
			const notification = {
				channel: "push" as const,
				to: "device-token",
				body: "Push body",
			};

			const result = await Effect.runPromise(
				Effect.either(validateNotification(notification as PushNotification)),
			);

			expect(result._tag).toBe("Left");
		});

		it("should validate in-app notification", async () => {
			const notification: InAppNotification = {
				channel: "in-app",
				to: "notification-system",
				userId: "user-123",
				body: "In-app message",
			};

			const result = await Effect.runPromise(
				validateNotification(notification),
			);
			expect(result).toBe(true);
		});

		it("should fail in-app notification without userId", async () => {
			const notification = {
				channel: "in-app" as const,
				to: "notification-system",
				body: "In-app message",
			};

			const result = await Effect.runPromise(
				Effect.either(validateNotification(notification as InAppNotification)),
			);

			expect(result._tag).toBe("Left");
			const error = (result as { _tag: "Left"; left: NotificationError }).left;
			expect(error).toBeInstanceOf(NotificationError);
			expect(error.reason).toBe("InvalidRecipient");
		});
	});

	describe("sanitizeContent", () => {
		it("should remove script tags", () => {
			const input = "Hello <script>alert(\"xss\")</script> World";
			const result = sanitizeContent(input);
			expect(result).toBe("Hello  World");
		});

		it("should remove iframe tags", () => {
			const input = "Content <iframe src=\"evil.com\"></iframe> here";
			const result = sanitizeContent(input);
			expect(result).toBe("Content  here");
		});

		it("should remove javascript: protocol", () => {
			const input = "<a href=\"javascript:alert(1)\">Click</a>";
			const result = sanitizeContent(input);
			expect(result).toBe("<a href=\"alert(1)\">Click</a>");
		});

		it("should remove event handlers", () => {
			const input = "<div onclick=\"alert(1)\">Click me</div>";
			const result = sanitizeContent(input);
			expect(result).toBe("<div>Click me</div>");
		});

		it("should handle multiple dangerous elements", () => {
			const input = "<script>bad()</script><iframe src=\"x\"></iframe><div onclick=\"y\">text</div>";
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
				subject: "Test <script>alert(\"xss\")</script>",
				body: "Hello <iframe src=\"evil.com\"></iframe> World",
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
