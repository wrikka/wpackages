import { Effect } from "effect";
import { type EmailNotification, NotificationService } from "../../src";

/**
 * Example 10: Check notification status
 */
export const checkStatusExample = Effect.gen(function*() {
	const notification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Test",
		body: "Test body",
	};

	const service = yield* NotificationService;

	// Send notification
	const sendResult = yield* service.send(notification);
	console.log("Notification sent:", sendResult.id);

	// Check status
	const status = yield* service.getStatus(sendResult.id);
	console.log("Notification status:", status);

	return status;
});
