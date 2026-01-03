import { Effect } from "effect";
import { NotificationServiceLive } from "../../src";
import { sendEmailExample } from "./send-email.usage";
import { sendSmsExample } from "./send-sms.usage";
import { sendPushExample } from "./send-push.usage";
import { sendInAppExample } from "./send-in-app.usage";
import { sendBatchExample } from "./send-batch.usage";
import { scheduleNotificationExample } from "./schedule-notification.usage";
import { useTemplateExample } from "./use-template.usage";
import { validateAndSendExample } from "./validate-and-send.usage";
import { errorHandlingExample } from "./error-handling.usage";
import { checkStatusExample } from "./check-status.usage";

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

export {
	sendEmailExample,
	sendSmsExample,
	sendPushExample,
	sendInAppExample,
	sendBatchExample,
	scheduleNotificationExample,
	useTemplateExample,
	validateAndSendExample,
	errorHandlingExample,
	checkStatusExample,
};
