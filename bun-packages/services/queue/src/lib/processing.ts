/**
 * Queue item processing utilities
 */

import type { QueueItem } from "../types";

/**
 * Checks if a queue item is ready to be processed
 */
export function isItemReady<T>(item: QueueItem<T>): boolean {
	if (item.scheduledFor === undefined) {
		return true;
	}
	return Date.now() >= item.scheduledFor;
}

/**
 * Sorts queue items by priority (highest first) and creation time (earliest first)
 */
export function sortQueueItems<T>(items: QueueItem<T>[]): QueueItem<T>[] {
	return items.sort((a, b) => {
		if (a.priority !== b.priority) {
			return b.priority - a.priority; // Higher priority first
		}
		return a.createdAt - b.createdAt; // Earlier creation first
	});
}
