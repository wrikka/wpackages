/**
 * Application composition and setup
 * Initializes the messaging service with Effect-TS
 */

import { Effect, Layer } from "effect";
import { NotificationService } from "./services";

/**
 * Create the notification service layer
 */
export const createNotificationLayer = (): Layer.Layer<NotificationService> => {
	return Layer.succeed(NotificationService, {
		send: (notification) =>
			Effect.succeed({
				id: `msg-${Date.now()}`,
				status: "sent" as const,
				sentAt: new Date(),
				notification,
			}),

		sendBatch: (notifications) =>
			Effect.succeed(
				notifications.map((n) => ({
					id: `msg-${Date.now()}`,
					status: "sent" as const,
					sentAt: new Date(),
					notification: n,
				})),
			),

		schedule: (notification, scheduledAt) =>
			Effect.succeed({
				id: `msg-${Date.now()}`,
				status: "scheduled" as const,
				sentAt: scheduledAt,
				notification,
			}),

		cancel: (_notificationId) => Effect.succeed(true),

		getStatus: (notificationId) =>
			Effect.succeed({
				id: notificationId,
				status: "sent" as const,
				sentAt: new Date(),
				notification: {
					channel: "email" as const,
					to: "user@example.com",
					body: "Test",
				},
			}),
	});
};

/**
 * Run the messaging application
 */
export const runApp = async (): Promise<string> => {
	console.log("Starting messaging application...");
	return "Messaging application started";
};
