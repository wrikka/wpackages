import { isFailure, isSuccess } from "functional";
import { parseCronExpression, validateCronExpression } from "./cron-parser";

// Example usage of the cron parser utility

// Validate cron expressions
console.log("Validating cron expressions:");
console.log(`'* * * * *' is valid: ${validateCronExpression("* * * * *")}`);
console.log(`'0 0 * * *' is valid: ${validateCronExpression("0 0 * * *")}`);
console.log(`'* * * *' is valid: ${validateCronExpression("* * * *")}`);

// Parse cron expressions
console.log("\nParsing cron expressions:");
const result1 = parseCronExpression("* * * * *");
if (isSuccess(result1)) {
	console.log(`'* * * * *' parsed to:`, result1.value);
}

const result2 = parseCronExpression("0 0 * * *");
if (isSuccess(result2)) {
	console.log(`'0 0 * * *' parsed to:`, result2.value);
}

const result3 = parseCronExpression("* * * *");
if (isFailure(result3)) {
	console.log(`'* * * *' failed to parse:`, result3.error);
}
