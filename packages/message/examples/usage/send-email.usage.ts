import { Effect } from "effect";
import { type EmailNotification, NotificationService } from "../../src";

/**
 * Example 1: Send a simple email notification
 */
export const sendEmailExample = Effect.gen(function*() {
	const notification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Welcome to WTS Framework!",
		body: "Thank you for joining us. Get started with our documentation.",
		priority: "normal",
	};

	const service = yield* NotificationService;
	const result = yield* service.send(notification);

	console.log("Email sent:", result);
	return result;
});
