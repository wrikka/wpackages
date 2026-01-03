import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import type { EmailNotification, InAppNotification, PushNotification, SmsNotification } from "../../src/types";
import { NotificationError } from "../../src/types";
import { validateNotification } from "../../src/utils/validation";

describe("Validation - validateNotification", () => {
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
