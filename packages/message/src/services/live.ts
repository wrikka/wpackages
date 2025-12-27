import { Effect, Layer } from "effect";
import { type Notification, NotificationError, type NotificationResult } from "../types";
import { NotificationService } from "./service";

/**
 * Generate a unique notification ID
 */
const generateId = (): string => {
	return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Simulate sending notification through different channels
 * In production, this would integrate with actual services like SendGrid, Twilio, etc.
 */
const sendNotification = (
	notification: Notification,
): Effect.Effect<NotificationResult, NotificationError> =>
	Effect.gen(function*() {
		const id = generateId();

		// Simulate channel-specific logic
		switch (notification.channel) {
			case "email":
				console.log(`[EMAIL] Sending to: ${notification.to}`);
				console.log(`[EMAIL] Subject: ${notification.subject || "No subject"}`);
				console.log(`[EMAIL] Body: ${notification.body}`);
				break;

			case "sms":
				console.log(`[SMS] Sending to: ${notification.to}`);
				console.log(`[SMS] Message: ${notification.body}`);
				break;

			case "push":
				console.log(`[PUSH] Sending to: ${notification.to}`);
				console.log(
					`[PUSH] Title: ${notification.channel === "push" ? notification.title : ""}`,
				);
				console.log(`[PUSH] Body: ${notification.body}`);
				break;

			case "in-app":
				console.log(
					`[IN-APP] Sending to user: ${notification.channel === "in-app" ? notification.userId : ""}`,
				);
				console.log(`[IN-APP] Message: ${notification.body}`);
				break;

			default:
				return yield* Effect.fail(
					new NotificationError({
						reason: "InvalidChannel",
						message: `Unknown channel: ${(notification as Notification).channel}`,
					}),
				);
		}

		// Simulate network delay
		yield* Effect.sleep("100 millis");

		return {
			id,
			status: "sent" as const,
			sentAt: new Date(),
		};
	});

/**
 * Live implementation of NotificationService
 */
export const NotificationServiceLive = Layer.succeed(
	NotificationService,
	NotificationService.of({
		send: (notification) => sendNotification(notification),

		sendBatch: (notifications) =>
			Effect.all(
				notifications.map((n) => sendNotification(n)),
				{
					concurrency: 5,
				},
			),

		schedule: (_, scheduledAt) =>
			Effect.succeed({
				id: generateId(),
				status: "scheduled" as const,
			}).pipe(
				Effect.tap((res) =>
					Effect.sync(() =>
						console.log(
							`[SCHEDULE] Notification ${res.id} scheduled for ${scheduledAt.toISOString()}`,
						)
					)
				),
			),

		cancel: (notificationId) =>
			Effect.sync(() => {
				console.log(`[CANCEL] Canceling notification ${notificationId}`);
				return true;
			}),

		getStatus: (notificationId) =>
			Effect.sync(() => {
				console.log(`[STATUS] Getting status for ${notificationId}`);
				return {
					id: notificationId,
					status: "sent" as const,
					sentAt: new Date(),
				};
			}),
	}),
);
