import { Cause, Effect, Exit, Option } from "effect";
import { parseCronExpression, validateCronExpression } from "./cron-parser";

// Example usage of the cron parser utility

// Validate cron expressions
console.log("Validating cron expressions:");
console.log(`'* * * * *' is valid: ${validateCronExpression("* * * * *")}`);
console.log(`'0 0 * * *' is valid: ${validateCronExpression("0 0 * * *")}`);
console.log(`'* * * *' is valid: ${validateCronExpression("* * * *")}`);

// Parse cron expressions
console.log("\nParsing cron expressions:");
const result1 = Effect.runSyncExit(parseCronExpression("* * * * *"));
if (Exit.isSuccess(result1)) {
	console.log(`'* * * * *' parsed to:`, result1.value);
}

const result2 = Effect.runSyncExit(parseCronExpression("0 0 * * *"));
if (Exit.isSuccess(result2)) {
	console.log(`'0 0 * * *' parsed to:`, result2.value);
}

const result3 = Effect.runSyncExit(parseCronExpression("* * * *"));
if (Exit.isFailure(result3)) {
	const failure = Cause.failureOption(result3.cause);
	if (Option.isSome(failure)) {
		console.log(`'* * * *' failed to parse:`, failure.value);
	} else {
		console.log(`'* * * *' failed to parse:`, result3.cause);
	}
}
