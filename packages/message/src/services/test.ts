import { Effect, Layer, Ref } from "effect";
import type { Notification, NotificationResult } from "../types";
import { NotificationService } from "./service";

/**
 * Test notification record for inspection
 */
export interface TestNotificationRecord {
	readonly notification: Notification;
	readonly result: NotificationResult;
	readonly timestamp: Date;
}

/**
 * Test context for NotificationService
 */
export interface TestNotificationContext {
	readonly sent: readonly TestNotificationRecord[];
	readonly scheduled: readonly TestNotificationRecord[];
	readonly cancelled: readonly string[];
}

/**
 * Create a test implementation of NotificationService that stores notifications in memory
 */
export const makeTestNotificationService = () =>
	Effect.gen(function*() {
		const sentRef = yield* Ref.make<readonly TestNotificationRecord[]>([]);
		const scheduledRef = yield* Ref.make<readonly TestNotificationRecord[]>([]);
		const cancelledRef = yield* Ref.make<readonly string[]>([]);

		const generateId = () => `test_notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

		return {
			service: NotificationService.of({
				send: (notification) =>
					Effect.gen(function*() {
						const id = generateId();
						const result: NotificationResult = {
							id,
							status: "sent",
							sentAt: new Date(),
						};

						yield* Ref.update(sentRef, (records) => [
							...records,
							{
								notification,
								result,
								timestamp: new Date(),
							},
						]);

						return result;
					}),

				sendBatch: (notifications) =>
					Effect.all(
						notifications.map((notification) =>
							Effect.gen(function*() {
								const id = generateId();
								const result: NotificationResult = {
									id,
									status: "sent",
									sentAt: new Date(),
								};

								yield* Ref.update(sentRef, (records) => [
									...records,
									{
										notification,
										result,
										timestamp: new Date(),
									},
								]);

								return result;
							})
						),
					),

				schedule: (notification, scheduledAt) =>
					Effect.gen(function*() {
						const id = generateId();
						const result: NotificationResult = {
							id,
							status: "scheduled",
						};

						yield* Ref.update(scheduledRef, (records) => [
							...records,
							{
								notification: { ...notification, scheduledAt },
								result,
								timestamp: new Date(),
							},
						]);

						return result;
					}),

				cancel: (notificationId) =>
					Effect.gen(function*() {
						yield* Ref.update(cancelledRef, (ids) => [...ids, notificationId]);
						return true;
					}),

				getStatus: (notificationId) =>
					Effect.gen(function*() {
						const sent = yield* Ref.get(sentRef);
						const scheduled = yield* Ref.get(scheduledRef);

						const record = sent.find((r) => r.result.id === notificationId)
							|| scheduled.find((r) => r.result.id === notificationId);

						if (record) {
							return record.result;
						}

						return {
							id: notificationId,
							status: "failed",
							error: "Notification not found",
						} as NotificationResult;
					}),
			}),
			getSent: Ref.get(sentRef),
			getScheduled: Ref.get(scheduledRef),
			getCancelled: Ref.get(cancelledRef),
		};
	});

/**
 * Test layer for NotificationService
 */
export const NotificationServiceTest = Layer.effect(
	NotificationService,
	Effect.map(makeTestNotificationService(), (ctx) => ctx.service),
);

/**
 * Get test context for assertions
 */
export const getTestContext = () =>
	Effect.gen(function*() {
		const ctx = yield* makeTestNotificationService();
		return {
			getSent: ctx.getSent,
			getScheduled: ctx.getScheduled,
			getCancelled: ctx.getCancelled,
		};
	});
