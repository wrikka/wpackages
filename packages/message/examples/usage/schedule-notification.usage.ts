import { Effect } from "effect";
import { type EmailNotification, NotificationService } from "../../src";

/**
 * Example 6: Schedule notification
 */
export const scheduleNotificationExample = Effect.gen(function*() {
	const notification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Scheduled Reminder",
		body: "This is your scheduled reminder",
	};

	const scheduledAt = new Date(Date.now() + 3600000); // 1 hour from now

	const service = yield* NotificationService;
	const result = yield* service.schedule(notification, scheduledAt);

	console.log("Notification scheduled:", result);
	return result;
});
