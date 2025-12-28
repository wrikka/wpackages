import { Effect } from "effect";
import { type Notification, NotificationError } from "../types";
import { sanitizeContent, validateEmail, validatePhoneNumber } from "../components";

/**
 * Validate email address
 */
export { validateEmail };

/**
 * Validate phone number
 */
export { validatePhoneNumber };

/**
 * Sanitize notification content (remove potential XSS, script tags, etc.)
 */
export { sanitizeContent };

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
 * Validate and sanitize notification
 */
export const validateAndSanitize = (
	notification: Notification,
): Effect.Effect<Notification, NotificationError> =>
	Effect.gen(function*() {
		yield* validateNotification(notification);

		const sanitizedBody = sanitizeContent(notification.body);
		const sanitizedSubject = notification.subject
			? sanitizeContent(notification.subject)
			: undefined;

		return yield* Effect.succeed({
			...notification,
			body: sanitizedBody,
			...(sanitizedSubject ? { subject: sanitizedSubject } : {}),
		});
	});
