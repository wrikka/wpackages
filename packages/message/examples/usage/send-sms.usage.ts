import { Effect } from "effect";
import { type SmsNotification, NotificationService } from "../../src";

/**
 * Example 2: Send SMS notification
 */
export const sendSmsExample = Effect.gen(function*() {
	const notification: SmsNotification = {
		channel: "sms",
		to: "+1234567890",
		body: "Your verification code is: 123456",
		priority: "high",
	};

	const service = yield* NotificationService;
	const result = yield* service.send(notification);

	console.log("SMS sent:", result);
	return result;
});
