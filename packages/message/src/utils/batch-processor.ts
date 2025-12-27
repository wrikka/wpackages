/**
 * Batch Processor - Pure functions for batch message processing
 * Handles chunking, grouping, and batch operations
 */

import type { Notification } from "../types";

/**
 * Chunk notifications into smaller batches
 */
export const chunkNotifications = (
	notifications: readonly Notification[],
	chunkSize: number,
): readonly (readonly Notification[])[] => {
	const chunks: (readonly Notification[])[] = [];
	for (let i = 0; i < notifications.length; i += chunkSize) {
		chunks.push(notifications.slice(i, i + chunkSize));
	}
	return chunks;
};

/**
 * Group notifications by channel
 */
export const groupByChannel = (
	notifications: readonly Notification[],
): Record<string, readonly Notification[]> => {
	const grouped: Record<string, Notification[]> = {};

	for (const notification of notifications) {
		const channel = notification.channel;
		if (!grouped[channel]) {
			grouped[channel] = [];
		}
		grouped[channel].push(notification);
	}

	return grouped;
};

/**
 * Group notifications by priority
 */
export const groupByPriority = (
	notifications: readonly Notification[],
): Record<string, readonly Notification[]> => {
	const grouped: Record<string, Notification[]> = {};

	for (const notification of notifications) {
		const priority = notification.priority || "normal";
		if (!grouped[priority]) {
			grouped[priority] = [];
		}
		grouped[priority].push(notification);
	}

	return grouped;
};

/**
 * Sort notifications by priority (urgent > high > normal > low)
 */
export const sortByPriority = (
	notifications: readonly Notification[],
): readonly Notification[] => {
	const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

	return [...notifications].sort((a, b) => {
		const aPriority = priorityOrder[a.priority || "normal"];
		const bPriority = priorityOrder[b.priority || "normal"];
		return aPriority - bPriority;
	});
};

/**
 * Filter duplicate recipients within a batch
 */
export const deduplicateRecipients = (
	notifications: readonly Notification[],
): readonly Notification[] => {
	const seen = new Set<string>();
	const result: Notification[] = [];

	for (const notification of notifications) {
		const recipients = Array.isArray(notification.to)
			? notification.to
			: [notification.to];

		const uniqueRecipients = recipients.filter((recipient) => {
			const key = `${notification.channel}:${recipient}`;
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});

		if (uniqueRecipients.length > 0) {
			result.push({
				...notification,
				to:
					uniqueRecipients.length === 1
						? uniqueRecipients[0]
						: (uniqueRecipients as readonly string[]),
			});
		}
	}

	return result;
};

/**
 * Merge notifications with same recipient and channel
 */
export const mergeNotifications = (
	notifications: readonly Notification[],
): readonly Notification[] => {
	const merged: Record<string, Notification> = {};

	for (const notification of notifications) {
		const recipients = Array.isArray(notification.to)
			? notification.to
			: [notification.to];

		for (const recipient of recipients) {
			const key = `${notification.channel}:${recipient}`;
			if (!merged[key]) {
				merged[key] = {
					...notification,
					to: recipient,
				};
			}
		}
	}

	return Object.values(merged);
};

/**
 * Calculate batch statistics
 */
export const calculateBatchStats = (
	notifications: readonly Notification[],
): {
	total: number;
	byChannel: Record<string, number>;
	byPriority: Record<string, number>;
} => {
	const byChannel: Record<string, number> = {};
	const byPriority: Record<string, number> = {};

	for (const notification of notifications) {
		const channel = notification.channel;
		const priority = notification.priority || "normal";

		byChannel[channel] = (byChannel[channel] || 0) + 1;
		byPriority[priority] = (byPriority[priority] || 0) + 1;
	}

	return {
		total: notifications.length,
		byChannel,
		byPriority,
	};
};
