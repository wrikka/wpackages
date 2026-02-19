/**
 * Queue item creation utilities
 */

import type { QueueItem } from "../types";
import { generateId } from "../utils";

/**
 * Creates a new queue item with generated ID and timestamp
 */
export function createQueueItem<T>(
	data: T,
	priority: number = 2,
	delay: number = 0,
): QueueItem<T> {
	const baseItem = {
		id: generateId(),
		data,
		priority,
		delay,
		createdAt: Date.now(),
	};

	return delay > 0
		? { ...baseItem, scheduledFor: Date.now() + delay }
		: baseItem;
}
