import { Effect } from "effect";
import type { EmailNotification, SmsNotification } from "../src/types";
import {
	sanitizeContent,
	validateAndSanitize,
	validateEmail,
	validateNotification,
	validatePhoneNumber,
} from "../src/utils/validation";

/**
 * Example 1: Basic email validation
 */
const emailValidationExample = Effect.gen(function*() {
	const validEmail = "user@example.com";
	const invalidEmail = "not-an-email";

	console.log("Validating emails:");

	const result1 = yield* Effect.either(validateEmail(validEmail));
	console.log(`${validEmail}:`, result1._tag === "Right" ? "Valid" : "Invalid");

	const result2 = yield* Effect.either(validateEmail(invalidEmail));
	console.log(
		`${invalidEmail}:`,
		result2._tag === "Right" ? "Valid" : "Invalid",
	);
});

/**
 * Example 2: Phone number validation
 */
const phoneValidationExample = Effect.gen(function*() {
	const validPhone = "+1234567890";
	const invalidPhone = "123-abc";

	console.log("\nValidating phone numbers:");

	const result1 = yield* Effect.either(validatePhoneNumber(validPhone));
	console.log(`${validPhone}:`, result1._tag === "Right" ? "Valid" : "Invalid");

	const result2 = yield* Effect.either(validatePhoneNumber(invalidPhone));
	console.log(
		`${invalidPhone}:`,
		result2._tag === "Right" ? "Valid" : "Invalid",
	);
});

/**
 * Example 3: Notification validation
 */
const notificationValidationExample = Effect.gen(function*() {
	const emailNotif: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Welcome!",
		body: "Welcome to our platform!",
	};

	const smsNotif: SmsNotification = {
		channel: "sms",
		to: "+1234567890",
		body: "Your verification code is 123456",
	};

	console.log("\nValidating notifications:");

	const result1 = yield* Effect.either(validateNotification(emailNotif));
	console.log(
		"Email notification:",
		result1._tag === "Right" ? "Valid" : "Invalid",
	);

	const result2 = yield* Effect.either(validateNotification(smsNotif));
	console.log(
		"SMS notification:",
		result2._tag === "Right" ? "Valid" : "Invalid",
	);
});

/**
 * Example 4: Content sanitization
 */
const sanitizationExample = Effect.sync(() => {
	const maliciousContent = `
		<p>This is clean content.</p>
		<script>alert('XSS attack!');</script>
		<img src="invalid-source" onerror="alert('Another attack!')">
	`;

	const sanitized = sanitizeContent(maliciousContent);

	console.log("Original:", maliciousContent);
	console.log("After:", sanitized);
});

/**
 * Example 5: Validate and sanitize together
 */
const validateAndSanitizeExample = Effect.gen(function*() {
	const notification: EmailNotification = {
		channel: "email",
		to: "user@example.com",
		subject: "Alert! <script>alert(\"xss\")</script>",
		body: "Click here: <a href=\"javascript:void(0)\">Link</a>",
	};

	console.log("\nValidate and sanitize:");
	console.log("Original subject:", notification.subject);
	console.log("Original body:", notification.body);

	const result = yield* validateAndSanitize(notification);
	console.log("Sanitized subject:", result.subject);
	console.log("Sanitized body:", result.body);
});

/**
 * Run all validation examples
 */
export const runValidationExamples = Effect.gen(function*() {
	console.log("=== Validation Utils Examples ===\n");

	yield* emailValidationExample;
	yield* phoneValidationExample;
	yield* notificationValidationExample;
	yield* sanitizationExample;
	yield* validateAndSanitizeExample;
});

// Uncomment to run:
// Effect.runPromise(runValidationExamples);
