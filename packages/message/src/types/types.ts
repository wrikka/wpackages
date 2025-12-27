import { Data } from "effect";

/**
 * Notification channel types
 */
export type NotificationChannel = "email" | "sms" | "push" | "in-app";

/**
 * Notification priority levels
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Base notification message structure
 */
export interface NotificationMessage {
	readonly to: string | readonly string[];
	readonly subject?: string;
	readonly body: string;
	readonly channel: NotificationChannel;
	readonly priority?: NotificationPriority;
	readonly template?: string;
	readonly data?: Record<string, unknown>;
	readonly scheduledAt?: Date;
}

/**
 * Email notification specific fields
 */
export interface EmailNotification extends NotificationMessage {
	readonly channel: "email";
	readonly from?: string;
	readonly cc?: readonly string[];
	readonly bcc?: readonly string[];
	readonly attachments?: readonly {
		readonly filename: string;
		readonly content: string | Buffer;
	}[];
}

/**
 * SMS notification specific fields
 */
export interface SmsNotification extends NotificationMessage {
	readonly channel: "sms";
	readonly from?: string;
}

/**
 * Push notification specific fields
 */
export interface PushNotification extends NotificationMessage {
	readonly channel: "push";
	readonly title: string;
	readonly icon?: string;
	readonly badge?: string;
	readonly sound?: string;
	readonly clickAction?: string;
}

/**
 * In-app notification specific fields
 */
export interface InAppNotification extends NotificationMessage {
	readonly channel: "in-app";
	readonly userId: string;
	readonly actionUrl?: string;
	readonly metadata?: Record<string, unknown>;
}

/**
 * Union type for all notification types
 */
export type Notification =
	| EmailNotification
	| SmsNotification
	| PushNotification
	| InAppNotification;

/**
 * Notification result
 */
export interface NotificationResult {
	readonly id: string;
	readonly status: "sent" | "failed" | "scheduled";
	readonly sentAt?: Date;
	readonly error?: string;
}

/**
 * Notification errors
 */
export class NotificationError extends Data.TaggedError("NotificationError")<{
	readonly reason:
		| "InvalidChannel"
		| "SendFailed"
		| "TemplateNotFound"
		| "InvalidRecipient"
		| "Unknown";
	readonly message?: string;
}> {}
