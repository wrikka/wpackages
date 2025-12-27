/**
 * Message Types Constants
 * Standard message types and channels
 */

export const MESSAGE_TYPES = {
	EMAIL: "email",
	SMS: "sms",
	PUSH: "push",
	IN_APP: "in-app",
	WEBHOOK: "webhook",
	NOTIFICATION: "notification",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export const MESSAGE_CHANNELS = {
	EMAIL: "email",
	SMS: "sms",
	PUSH_NOTIFICATION: "push",
	IN_APP_MESSAGE: "in-app",
} as const;

export type MessageChannel = (typeof MESSAGE_CHANNELS)[keyof typeof MESSAGE_CHANNELS];

export const MESSAGE_PRIORITIES = {
	LOW: "low",
	NORMAL: "normal",
	HIGH: "high",
	URGENT: "urgent",
} as const;

export type MessagePriority = (typeof MESSAGE_PRIORITIES)[keyof typeof MESSAGE_PRIORITIES];

export const MESSAGE_STATUSES = {
	PENDING: "pending",
	SENT: "sent",
	DELIVERED: "delivered",
	FAILED: "failed",
	BOUNCED: "bounced",
} as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[keyof typeof MESSAGE_STATUSES];
