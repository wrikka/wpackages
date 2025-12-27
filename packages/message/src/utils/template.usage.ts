import { Effect } from "effect";
import { renderTemplate, validateTemplate } from "./template";

/**
 * Example: Basic template rendering
 */
const basicRenderingExample = Effect.gen(function*() {
	const template = "Hello {{name}}, welcome to {{platform}}!";
	const data = {
		name: "John Doe",
		platform: "WTS Framework",
	};

	const result = yield* renderTemplate(template, data);
	console.log("Basic rendering:", result);
	// Output: Hello John Doe, welcome to WTS Framework!

	return result;
});

/**
 * Example: Email template rendering
 */
const emailTemplateExample = Effect.gen(function*() {
	const emailTemplate = `
Dear {{customerName}},

Thank you for your order #{{orderId}}.

Order Details:
- Product: {{productName}}
- Quantity: {{quantity}}
- Total: {{total}}

Your order will be delivered to {{address}}.

Best regards,
{{companyName}}
	`;

	const data = {
		customerName: "Alice Smith",
		orderId: "ORD-12345",
		productName: "Premium Widget",
		quantity: 2,
		total: 199.98,
		address: "123 Main St, Bangkok",
		companyName: "Wrikka Inc.",
	};

	const result = yield* renderTemplate(emailTemplate, data);
	console.log("Email template:", result);

	return result;
});

/**
 * Example: Template validation before rendering
 */
const validateBeforeRenderExample = Effect.gen(function*() {
	const template = "Hello {{name}}, your code is {{code}}";

	// Validate template first
	const isValid = yield* validateTemplate(template);
	console.log("Template is valid:", isValid);

	// Then render
	const data = { name: "Bob", code: "ABC123" };
	const result = yield* renderTemplate(template, data);
	console.log("Rendered:", result);

	return result;
});

/**
 * Example: Error handling for missing variables
 */
const errorHandlingExample = Effect.gen(function*() {
	const template = "Hello {{name}}, welcome to {{platform}}!";
	const incompleteData = { name: "Charlie" }; // missing 'platform'

	const result = yield* Effect.either(renderTemplate(template, incompleteData));

	if (result._tag === "Left") {
		console.error("Template rendering failed:", result.left.message);
	} else {
		console.log("Rendered:", result.right);
	}

	return result;
});

/**
 * Example: Multiple variable replacements
 */
const multipleReplacementsExample = Effect.gen(function*() {
	const template = "{{greeting}} {{name}}! {{greeting}} again, {{name}}!";
	const data = {
		greeting: "Hello",
		name: "David",
	};

	const result = yield* renderTemplate(template, data);
	console.log("Multiple replacements:", result);
	// Output: Hello David! Hello again, David!

	return result;
});

/**
 * Run all examples
 */
const runAllExamples = Effect.gen(function*() {
	console.log("=== Template Utilities Usage Examples ===\n");

	console.log("1. Basic Rendering:");
	yield* basicRenderingExample;

	console.log("\n2. Email Template:");
	yield* emailTemplateExample;

	console.log("\n3. Validation Before Render:");
	yield* validateBeforeRenderExample;

	console.log("\n4. Error Handling:");
	yield* errorHandlingExample;

	console.log("\n5. Multiple Replacements:");
	yield* multipleReplacementsExample;
});

// Run if this file is executed directly
if (import.meta.main) {
	Effect.runPromise(runAllExamples).catch(console.error);
}

export {
	basicRenderingExample,
	emailTemplateExample,
	errorHandlingExample,
	multipleReplacementsExample,
	runAllExamples,
	validateBeforeRenderExample,
};
