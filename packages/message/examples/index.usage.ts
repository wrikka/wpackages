import { Effect } from "effect";
import {
	type EmailNotification,
	type InAppNotification,
	NotificationService,
	NotificationServiceLive,
	type PushNotification,
	renderTemplate,
	type SmsNotification,
	validateAndSanitize,
} from "../src";

/**
 * Example 1: Send a simple email notification
 */
const sendEmailExample = Effect.gen(function*() {
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

/**
 * Example 2: Send SMS notification
 */
const sendSmsExample = Effect.gen(function*() {
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

/**
 * Example 3: Send push notification
 */
const sendPushExample = Effect.gen(function*() {
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

/**
 * Example 4: Send in-app notification
 */
const sendInAppExample = Effect.gen(function*() {
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

/**
 * Example 5: Send batch notifications
 */
const sendBatchExample = Effect.gen(function*() {
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

/**
 * Example 6: Schedule notification
 */
const scheduleNotificationExample = Effect.gen(function*() {
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

/**
 * Example 7: Use template with notification
 */
const useTemplateExample = Effect.gen(function*() {
	const template = "Hello {{name}}, your order {{orderId}} is {{status}}!";
	const data = {
		name: "John Doe",
		orderId: "ORD-123",
		status: "confirmed",
	};

	const body = yield* renderTemplate(template, data);

	const notification: EmailNotification = {
		channel: "email",
		to: "john@example.com",
		subject: "Order Confirmation",
		body,
	};

	const service = yield* NotificationService;
	const result = yield* service.send(notification);

	console.log("Templated notification sent:", result);
	return result;
});

/**
 * Example 8: Validate and sanitize before sending
 */
const validateAndSendExample = Effect.gen(function*() {
	const unsafeNotification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Alert <script>alert(\"xss\")</script>",
		body: "Click here: <a href=\"javascript:void(0)\">Link</a>",
	};

	// Validate and sanitize
	const safeNotification = yield* validateAndSanitize(unsafeNotification);

	// Send sanitized notification
	const service = yield* NotificationService;
	const result = yield* service.send(safeNotification);

	console.log("Safe notification sent:", result);
	return result;
});

/**
 * Example 9: Error handling
 */
const errorHandlingExample = Effect.gen(function*() {
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

/**
 * Example 10: Check notification status
 */
const checkStatusExample = Effect.gen(function*() {
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

/**
 * Run all examples
 */
export const runNotificationExamples = Effect.gen(function*() {
	console.log("=== Notification Service Examples ===\n");

	console.log("--- Example 1: Send Email ---");
	yield* sendEmailExample;
	console.log();

	console.log("--- Example 2: Send SMS ---");
	yield* sendSmsExample;
	console.log();

	console.log("--- Example 3: Send Push ---");
	yield* sendPushExample;
	console.log();

	console.log("--- Example 4: Send In-App ---");
	yield* sendInAppExample;
	console.log();

	console.log("--- Example 5: Batch Send ---");
	yield* sendBatchExample;
	console.log();

	console.log("--- Example 6: Schedule Notification ---");
	yield* scheduleNotificationExample;
	console.log();

	console.log("--- Example 7: Use Template ---");
	yield* useTemplateExample;
	console.log();

	console.log("--- Example 8: Validate and Send ---");
	yield* validateAndSendExample;
	console.log();

	console.log("--- Example 9: Error Handling ---");
	yield* errorHandlingExample;
	console.log();

	console.log("--- Example 10: Check Status ---");
	yield* checkStatusExample;
});

// Run with live service
export const main = Effect.provide(
	runNotificationExamples,
	NotificationServiceLive,
);

// Uncomment to run:
// Effect.runPromise(main).catch(console.error);
