import { Context, type Effect } from "effect";
import type { Notification, NotificationResult } from "../types";
import type { NotificationError } from "../types";

/**
 * Notification service interface
 */
export interface NotificationService {
	/**
	 * Send a notification through specified channel
	 */
	readonly send: (
		notification: Notification,
	) => Effect.Effect<NotificationResult, NotificationError>;

	/**
	 * Send multiple notifications in batch
	 */
	readonly sendBatch: (
		notifications: readonly Notification[],
	) => Effect.Effect<readonly NotificationResult[], NotificationError>;

	/**
	 * Schedule a notification to be sent later
	 */
	readonly schedule: (
		notification: Notification,
		scheduledAt: Date,
	) => Effect.Effect<NotificationResult, NotificationError>;

	/**
	 * Cancel a scheduled notification
	 */
	readonly cancel: (
		notificationId: string,
	) => Effect.Effect<boolean, NotificationError>;

	/**
	 * Get notification status
	 */
	readonly getStatus: (
		notificationId: string,
	) => Effect.Effect<NotificationResult, NotificationError>;
}

/**
 * Notification service tag for Effect Context
 */
export const NotificationService = Context.GenericTag<NotificationService>(
	"NotificationService",
);
