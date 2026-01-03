import { Effect } from "effect";
import { type InAppNotification, NotificationService } from "../../src";

/**
 * Example 4: Send in-app notification
 */
export const sendInAppExample = Effect.gen(function*() {
	const notification: InAppNotification = {
		channel: "in-app",
		to: "notification-system",
		userId: "user-123",
		body: "Your report is ready to download",
		actionUrl: "/reports/123",
		priority: "normal",
		metadata: {
			reportId: "123",
			reportType: "monthly",
		},
	};

	const service = yield* NotificationService;
	const result = yield* service.send(notification);

	console.log("In-app notification sent:", result);
	return result;
});
