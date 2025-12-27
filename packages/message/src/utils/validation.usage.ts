import { Effect } from "effect";
import type { EmailNotification, InAppNotification, PushNotification, SmsNotification } from "../types";
import {
	sanitizeContent,
	validateAndSanitize,
	validateEmail,
	validateNotification,
	validatePhoneNumber,
} from "./validation";

/**
 * Example: Email validation
 */
const emailValidationExample = Effect.gen(function*() {
	console.log("=== Email Validation Examples ===");

	const validEmail = "user@example.com";
	const invalidEmail = "invalid-email";

	// Valid email
	const result1 = yield* Effect.either(validateEmail(validEmail));
	console.log(`Email "${validEmail}" is valid:`, result1._tag === "Right");

	// Invalid email
	const result2 = yield* Effect.either(validateEmail(invalidEmail));
	console.log(`Email "${invalidEmail}" is valid:`, result2._tag === "Right");
	if (result2._tag === "Left") {
		console.log("Error:", result2.left.message);
	}
});

/**
 * Example: Phone number validation
 */
const phoneValidationExample = Effect.gen(function*() {
	console.log("\n=== Phone Number Validation Examples ===");

	const validPhone = "+66812345678";
	const invalidPhone = "0812345678";

	// Valid phone
	const result1 = yield* Effect.either(validatePhoneNumber(validPhone));
	console.log(`Phone "${validPhone}" is valid:`, result1._tag === "Right");

	// Invalid phone (missing country code)
	const result2 = yield* Effect.either(validatePhoneNumber(invalidPhone));
	console.log(`Phone "${invalidPhone}" is valid:`, result2._tag === "Right");
	if (result2._tag === "Left") {
		console.log("Error:", result2.left.message);
	}
});

/**
 * Example: Email notification validation
 */
const emailNotificationValidationExample = Effect.gen(function*() {
	console.log("\n=== Email Notification Validation ===");

	const validNotification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Welcome!",
		body: "Thank you for joining us.",
	};

	const invalidNotification: EmailNotification = {
		channel: "email",
		to: "invalid-email",
		subject: "Test",
		body: "Test body",
	};

	// Valid notification
	const result1 = yield* Effect.either(
		validateNotification(validNotification),
	);
	console.log("Valid notification:", result1._tag === "Right");

	// Invalid notification
	const result2 = yield* Effect.either(
		validateNotification(invalidNotification),
	);
	console.log("Invalid notification:", result2._tag === "Right");
	if (result2._tag === "Left") {
		console.log("Error:", result2.left.message);
	}
});

/**
 * Example: SMS notification validation
 */
const smsNotificationValidationExample = Effect.gen(function*() {
	console.log("\n=== SMS Notification Validation ===");

	const notification: SmsNotification = {
		channel: "sms",
		to: "+66812345678",
		body: "Your verification code is: 123456",
	};

	const result = yield* Effect.either(validateNotification(notification));
	console.log("SMS notification valid:", result._tag === "Right");
});

/**
 * Example: Push notification validation
 */
const pushNotificationValidationExample = Effect.gen(function*() {
	console.log("\n=== Push Notification Validation ===");

	const notification: PushNotification = {
		channel: "push",
		to: "device-token-123",
		title: "New Message",
		body: "You have received a new message",
	};

	const result = yield* Effect.either(validateNotification(notification));
	console.log("Push notification valid:", result._tag === "Right");
});

/**
 * Example: In-app notification validation
 */
const inAppNotificationValidationExample = Effect.gen(function*() {
	console.log("\n=== In-App Notification Validation ===");

	const validNotification: InAppNotification = {
		channel: "in-app",
		to: "notification-system",
		userId: "user-123",
		body: "Your report is ready",
		actionUrl: "/reports/123",
	};

	const invalidNotification = {
		channel: "in-app" as const,
		to: "notification-system",
		body: "Test",
		// Missing userId
	};

	// Valid notification
	const result1 = yield* Effect.either(
		validateNotification(validNotification),
	);
	console.log("Valid in-app notification:", result1._tag === "Right");

	// Invalid notification (missing userId)
	const result2 = yield* Effect.either(
		validateNotification(invalidNotification as InAppNotification),
	);
	console.log("Invalid in-app notification:", result2._tag === "Right");
	if (result2._tag === "Left") {
		console.log("Error:", result2.left.message);
	}
});

/**
 * Example: Content sanitization
 */
const sanitizationExample = () => {
	console.log("\n=== Content Sanitization Examples ===");

	const maliciousContent = "Hello <script>alert(\"XSS\")</script> World";
	const sanitized1 = sanitizeContent(maliciousContent);
	console.log("Original:", maliciousContent);
	console.log("Sanitized:", sanitized1);

	const iframeContent = "<iframe src=\"evil.com\"></iframe>";
	const sanitized2 = sanitizeContent(iframeContent);
	console.log("\nOriginal:", iframeContent);
	console.log("Sanitized:", sanitized2);

	const eventHandler = "<div onclick=\"alert(1)\">Click me</div>";
	const sanitized3 = sanitizeContent(eventHandler);
	console.log("\nOriginal:", eventHandler);
	console.log("Sanitized:", sanitized3);

	const safeContent = "<p>Hello <strong>World</strong></p>";
	const sanitized4 = sanitizeContent(safeContent);
	console.log("\nOriginal:", safeContent);
	console.log("Sanitized:", sanitized4);
};

/**
 * Example: Validate and sanitize combined
 */
const validateAndSanitizeExample = Effect.gen(function*() {
	console.log("\n=== Validate and Sanitize Combined ===");

	const notification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Alert <script>alert(\"xss\")</script>",
		body: "Hello <iframe src=\"evil.com\"></iframe> World",
	};

	console.log("Original notification:");
	console.log("Subject:", notification.subject);
	console.log("Body:", notification.body);

	const sanitized = yield* validateAndSanitize(notification);

	console.log("\nSanitized notification:");
	console.log("Subject:", sanitized.subject);
	console.log("Body:", sanitized.body);
});

/**
 * Example: Multiple recipients validation
 */
const multipleRecipientsExample = Effect.gen(function*() {
	console.log("\n=== Multiple Recipients Validation ===");

	const notification: EmailNotification = {
		channel: "email",
		to: ["user1@example.com", "user2@example.com", "invalid-email"],
		subject: "Broadcast",
		body: "This is a broadcast message",
	};

	const result = yield* Effect.either(validateNotification(notification));
	console.log("Multiple recipients valid:", result._tag === "Right");
	if (result._tag === "Left") {
		console.log("Error:", result.left.message);
	}
});

/**
 * Run all examples
 */
const runAllExamples = Effect.gen(function*() {
	console.log("=== Validation Utilities Usage Examples ===\n");

	yield* emailValidationExample;
	yield* phoneValidationExample;
	yield* emailNotificationValidationExample;
	yield* smsNotificationValidationExample;
	yield* pushNotificationValidationExample;
	yield* inAppNotificationValidationExample;
	sanitizationExample();
	yield* validateAndSanitizeExample;
	yield* multipleRecipientsExample;

	console.log("\n=== All Examples Completed ===");
});

// Run if this file is executed directly
if (import.meta.main) {
	Effect.runPromise(runAllExamples).catch(console.error);
}

export {
	emailNotificationValidationExample,
	emailValidationExample,
	inAppNotificationValidationExample,
	multipleRecipientsExample,
	phoneValidationExample,
	pushNotificationValidationExample,
	runAllExamples,
	sanitizationExample,
	smsNotificationValidationExample,
	validateAndSanitizeExample,
};
