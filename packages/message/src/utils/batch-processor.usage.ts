/**
 * Batch Processor Usage Examples
 */

import {
	chunkNotifications,
	groupByChannel,
	groupByPriority,
	sortByPriority,
	deduplicateRecipients,
	mergeNotifications,
	calculateBatchStats,
} from "./batch-processor";
import type { Notification } from "../types";

const notifications: readonly Notification[] = [
	{
		channel: "email",
		to: "user1@example.com",
		body: "Welcome!",
		priority: "high",
	},
	{
		channel: "email",
		to: "user2@example.com",
		body: "Reminder",
		priority: "normal",
	},
	{
		channel: "sms",
		to: "+1234567890",
		body: "Code: 123456",
		priority: "urgent",
	},
	{
		channel: "push",
		to: "device-token",
		title: "Alert",
		body: "System update",
		priority: "low",
	},
];

// Example 1: Chunk notifications for batch processing
const chunks = chunkNotifications(notifications, 2);
console.log("Chunks:", chunks.length); // 2 chunks of 2 notifications each

// Example 2: Group by channel
const byChannel = groupByChannel(notifications);
console.log("By channel:", {
	email: byChannel["email"]?.length,
	sms: byChannel["sms"]?.length,
	push: byChannel["push"]?.length,
});

// Example 3: Group by priority
const byPriority = groupByPriority(notifications);
console.log("By priority:", {
	urgent: byPriority["urgent"]?.length,
	high: byPriority["high"]?.length,
	normal: byPriority["normal"]?.length,
	low: byPriority["low"]?.length,
});

// Example 4: Sort by priority (process urgent first)
const sorted = sortByPriority(notifications);
console.log("Sorted priorities:", sorted.map((n) => n.priority));

// Example 5: Deduplicate recipients
const withDuplicates: readonly Notification[] = [
	{
		channel: "email",
		to: ["user@example.com", "user@example.com", "other@example.com"],
		body: "Test",
	},
];
const deduped = deduplicateRecipients(withDuplicates);
console.log("Deduplicated:", deduped);

// Example 6: Merge notifications
const toMerge: readonly Notification[] = [
	{
		channel: "email",
		to: "user@example.com",
		body: "Message 1",
	},
	{
		channel: "email",
		to: "user@example.com",
		body: "Message 2",
	},
];
const merged = mergeNotifications(toMerge);
console.log("Merged count:", merged.length); // 1

// Example 7: Calculate batch statistics
const stats = calculateBatchStats(notifications);
console.log("Batch stats:", stats);
// {
//   total: 4,
//   byChannel: { email: 2, sms: 1, push: 1 },
//   byPriority: { high: 1, normal: 1, urgent: 1, low: 1 }
// }

// Example 8: Complex workflow - prepare batch for sending
const prepareBatch = (notifs: readonly Notification[]) => {
	// 1. Deduplicate
	const deduped = deduplicateRecipients(notifs);

	// 2. Sort by priority
	const sorted = sortByPriority(deduped);

	// 3. Group by channel
	const grouped = groupByChannel(sorted);

	// 4. Chunk for processing
	const chunks = Object.entries(grouped).map(([channel, items]) => ({
		channel,
		chunks: chunkNotifications(items, 100),
	}));

	return chunks;
};

const prepared = prepareBatch(notifications);
console.log("Prepared batches:", prepared);
