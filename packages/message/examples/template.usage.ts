import { Effect } from "effect";
import { renderTemplate, validateTemplate } from "../src/utils/template";

/**
 * Example 1: Basic template rendering
 */
const basicExample = Effect.gen(function*() {
	const template = "Hello {{name}}, welcome to {{platform}}!";
	const data = {
		name: "John Doe",
		platform: "WTS Framework",
	};

	const result = yield* renderTemplate(template, data);
	console.log("Basic template result:", result);
	// Output: "Hello John Doe, welcome to WTS Framework!"

	return result;
});

/**
 * Example 2: Email template with multiple variables
 */
const emailExample = Effect.gen(function*() {
	const template = `
Dear {{customerName}},

Your order #{{orderId}} has been shipped!

Tracking number: {{trackingNumber}}
Estimated delivery: {{deliveryDate}}

Thank you for your purchase!

Best regards,
{{companyName}}
	`.trim();

	const data = {
		customerName: "Alice Smith",
		orderId: "ORD-2024-001",
		trackingNumber: "TRK123456789",
		deliveryDate: "2024-01-20",
		companyName: "Wrikka",
	};

	const result = yield* renderTemplate(template, data);
	console.log("Email template result:", result);

	return result;
});

/**
 * Example 3: Template validation
 */
const validationExample = Effect.gen(function*() {
	const validTemplate = "Hello {{name}}!";
	const invalidTemplate = "Hello {{name}";

	const isValid = yield* validateTemplate(validTemplate);
	console.log("Valid template check:", isValid); // true

	// This will fail
	const isInvalid = yield* validateTemplate(invalidTemplate);
	console.log("Invalid template check:", isInvalid);
});

/**
 * Example 4: Handle validation errors
 */
const errorHandlingExample = Effect.gen(function*() {
	const template = "Hello {{name}}!";
	const incompleteData = {}; // Missing 'name'

	const result = yield* Effect.either(renderTemplate(template, incompleteData));

	if (result._tag === "Left") {
		console.log("Template rendering failed:", result.left.message);
	} else {
		console.log("Template rendered:", result.right);
	}
});

/**
 * Run examples
 */
export const runTemplateExamples = Effect.gen(function*() {
	console.log("=== Template Utils Examples ===\n");

	yield* basicExample;
	console.log();

	yield* emailExample;
	console.log();

	yield* Effect.either(validationExample);
	console.log();

	yield* errorHandlingExample;
});

// Uncomment to run:
// Effect.runPromise(runTemplateExamples);
