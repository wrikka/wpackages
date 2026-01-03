import { Effect } from "effect";
import { type EmailNotification, NotificationService } from "../../src";

/**
 * Example 5: Send batch notifications
 */
export const sendBatchExample = Effect.gen(function*() {
	const notifications: EmailNotification[] = [
		{
			channel: "email",
			to: "user1@example.com",
			subject: "Batch Email 1",
			body: "Content for user 1",
		},
		{
			channel: "email",
			to: "user2@example.com",
			subject: "Batch Email 2",
			body: "Content for user 2",
		},
		{
			channel: "email",
			to: "user3@example.com",
			subject: "Batch Email 3",
			body: "Content for user 3",
		},
	];

	const service = yield* NotificationService;
	const results = yield* service.sendBatch(notifications);

	console.log(`Batch sent: ${results.length} notifications`);
	return results;
});
