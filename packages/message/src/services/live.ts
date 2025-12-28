import { Effect, Layer } from "effect";
import { type Notification, NotificationError, type NotificationResult } from "../types";
import { IdGeneratorService, IdGeneratorServiceLive } from "./id-generator.service";
import { LoggerService, LoggerServiceLive } from "./logger.service";
import { NotificationService } from "./service";

/**
 * Simulate sending notification through different channels
 * In production, this would integrate with actual services like SendGrid, Twilio, etc.
 */
const sendNotification = (
	deps: {
		readonly logger: LoggerService;
		readonly idGenerator: { readonly nextId: Effect.Effect<string> };
	},
	notification: Notification,
): Effect.Effect<NotificationResult, NotificationError, never> =>
	Effect.flatMap(deps.idGenerator.nextId, (id) => {
		const logEffect = (() => {
			switch (notification.channel) {
				case "email":
					return deps.logger.info("[EMAIL] Sending", {
						to: notification.to,
						subject: notification.subject ?? "No subject",
					});
				case "sms":
					return deps.logger.info("[SMS] Sending", {
						to: notification.to,
					});
				case "push":
					return deps.logger.info("[PUSH] Sending", {
						to: notification.to,
						title: notification.title,
					});
				case "in-app":
					return deps.logger.info("[IN-APP] Sending", {
						to: notification.to,
						userId: notification.userId,
					});
				default:
					return Effect.fail(
						new NotificationError({
							reason: "InvalidChannel",
							message: `Unknown channel: ${(notification as Notification).channel}`,
						}),
					);
			}
		})();

		return logEffect.pipe(
			Effect.zipRight(Effect.sleep("100 millis")),
			Effect.as({
				id,
				status: "sent" as const,
				sentAt: new Date(),
			}),
		);
	});

/**
 * Live implementation of NotificationService
 */
export const NotificationServiceLive = Layer.effect(
	NotificationService,
	Effect.map(
		Effect.all([IdGeneratorService, LoggerService]),
		([idGenerator, logger]) => {
			const deps = { logger, idGenerator } as const;
			return NotificationService.of({
				send: (notification) => sendNotification(deps, notification),

				sendBatch: (notifications) =>
					Effect.all(
						notifications.map((n) => sendNotification(deps, n)),
						{
							concurrency: 5,
						},
					),

				schedule: (_, scheduledAt) =>
					Effect.flatMap(idGenerator.nextId, (id) =>
						logger
							.info("[SCHEDULE] Notification scheduled", {
								id,
								scheduledAt: scheduledAt.toISOString(),
							})
							.pipe(
								Effect.as({
									id,
									status: "scheduled" as const,
								}),
							),
					),

				cancel: (notificationId) =>
					logger
						.info("[CANCEL] Canceling notification", { notificationId })
						.pipe(Effect.as(true)),

				getStatus: (notificationId) =>
					logger
						.debug("[STATUS] Getting status", { notificationId })
						.pipe(
							Effect.as({
								id: notificationId,
								status: "sent" as const,
								sentAt: new Date(),
							}),
						),
			});
		},
	),
).pipe(Layer.provide(LoggerServiceLive), Layer.provide(IdGeneratorServiceLive));
