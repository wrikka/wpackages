import { Effect } from "effect";
import { type EmailNotification, NotificationService, renderTemplate } from "../../src";

/**
 * Example 7: Use template with notification
 */
export const useTemplateExample = Effect.gen(function*() {
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
