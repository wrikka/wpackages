import { Effect } from "effect";
import { type PushNotification, NotificationService } from "../../src";

/**
 * Example 3: Send push notification
 */
export const sendPushExample = Effect.gen(function*() {
	const notification: PushNotification = {
		channel: "push",
		to: "device-token-abc123",
		title: "New Message",
		body: "You have a new message from John",
		priority: "high",
		icon: "/icon.png",
		clickAction: "/messages",
	};

	const service = yield* NotificationService;
	const result = yield* service.send(notification);

	console.log("Push notification sent:", result);
	return result;
});
