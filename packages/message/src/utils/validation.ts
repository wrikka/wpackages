import { Effect } from "effect";
import { type Notification, NotificationError } from "../types";

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (basic international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Validate email address
 */
export const validateEmail = (
	email: string,
): Effect.Effect<boolean, NotificationError> =>
	Effect.gen(function*() {
		if (!EMAIL_REGEX.test(email)) {
			return yield* Effect.fail(
				new NotificationError({
					reason: "InvalidRecipient",
					message: `Invalid email address: ${email}`,
				}),
			);
		}
		return yield* Effect.succeed(true);
	});

/**
 * Validate phone number
 */
export const validatePhoneNumber = (
	phone: string,
): Effect.Effect<boolean, NotificationError> =>
	Effect.gen(function*() {
		if (!PHONE_REGEX.test(phone)) {
			return yield* Effect.fail(
				new NotificationError({
					reason: "InvalidRecipient",
					message: `Invalid phone number: ${phone}`,
				}),
			);
		}
		return yield* Effect.succeed(true);
	});

/**
 * Validate notification based on channel
 */
export const validateNotification = (
	notification: Notification,
): Effect.Effect<boolean, NotificationError> =>
	Effect.gen(function*() {
		// Validate recipients based on channel
		const recipients = Array.isArray(notification.to)
			? notification.to
			: [notification.to];

		switch (notification.channel) {
			case "email": {
				for (const recipient of recipients) {
					yield* validateEmail(recipient);
				}
				if (!notification.body) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "Email body is required",
						}),
					);
				}
				break;
			}

			case "sms": {
				for (const recipient of recipients) {
					yield* validatePhoneNumber(recipient);
				}
				if (!notification.body) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "SMS body is required",
						}),
					);
				}
				break;
			}

			case "push": {
				if (!notification.body) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "Push notification body is required",
						}),
					);
				}
				if (notification.channel === "push" && !notification.title) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "Push notification title is required",
						}),
					);
				}
				break;
			}

			case "in-app": {
				if (notification.channel === "in-app" && !notification.userId) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "In-app notification requires userId",
						}),
					);
				}
				if (!notification.body) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "InvalidRecipient",
							message: "In-app notification body is required",
						}),
					);
				}
				break;
			}

			default: {
				return yield* Effect.fail(
					new NotificationError({
						reason: "InvalidChannel",
						message: `Unknown notification channel: ${(notification as Notification).channel}`,
					}),
				);
			}
		}

		return yield* Effect.succeed(true);
	});

/**
 * Sanitize notification content (remove potential XSS, script tags, etc.)
 */
export const sanitizeContent = (content: string): string => {
	return content
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
};

/**
 * Validate and sanitize notification
 */
export const validateAndSanitize = (
	notification: Notification,
): Effect.Effect<Notification, NotificationError> =>
	Effect.gen(function*() {
		yield* validateNotification(notification);

		return yield* Effect.succeed({
			...notification,
			body: sanitizeContent(notification.body),
			subject: notification.subject
				? sanitizeContent(notification.subject)
				: undefined,
		} as Notification);
	});
