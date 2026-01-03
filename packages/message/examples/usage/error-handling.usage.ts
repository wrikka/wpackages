import { Effect } from "effect";
import { type EmailNotification, NotificationService } from "../../src";

/**
 * Example 9: Error handling
 */
export const errorHandlingExample = Effect.gen(function*() {
	const notification: EmailNotification = {
		channel: "email",
		to: "invalid-email", // This will fail validation
		subject: "Test",
		body: "Test body",
	};

	const service = yield* NotificationService;
	const result = yield* Effect.either(service.send(notification));

	if (result._tag === "Left") {
		console.log("Notification failed:", result.left.message);
	} else {
		console.log("Notification sent:", result.right);
	}
});
