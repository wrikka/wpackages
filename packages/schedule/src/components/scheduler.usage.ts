import { createScheduleDisplay, formatCronExpression } from "./scheduler";

// Example usage of the scheduler component

// Create schedule displays
console.log("Creating schedule displays:");
const display1 = createScheduleDisplay({
	name: "daily-backup",
	enabled: true,
	timezone: "UTC",
});
console.log(display1);

const display2 = createScheduleDisplay({
	name: "hourly-report",
	enabled: false,
});
console.log(display2);

// Format cron expressions
console.log("\nFormatting cron expressions:");
console.log(formatCronExpression("* * * * *"));
console.log(formatCronExpression("0 0 * * *"));
console.log(formatCronExpression("0 0 1 * *"));
console.log(formatCronExpression("* * * *")); // Invalid
