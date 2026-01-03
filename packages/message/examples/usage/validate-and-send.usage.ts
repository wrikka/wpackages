import { Effect } from "effect";
import { type EmailNotification, NotificationService, validateAndSanitize } from "../../src";

/**
 * Example 8: Validate and sanitize before sending
 */
export const validateAndSendExample = Effect.gen(function*() {
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
