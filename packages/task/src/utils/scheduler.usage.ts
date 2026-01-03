/**
 * ตัวอย่างการใช้งาน parseSchedule
 *
 * Run: bun run packages/task/src/utils/scheduler.usage.ts
 */

import type { Schedule } from "../types";
import { parseSchedule } from "./scheduler";

function runExample(description: string, schedule: Schedule, fromDate: Date) {
	console.log(`--- ${description} ---`);
	console.log(`Schedule: ${JSON.stringify(schedule)}`);
	console.log(`From Date: ${fromDate.toISOString()}`);

	const result = parseSchedule(schedule, fromDate);

	if (result._tag === "Success") {
		console.log(`Next Run Time: ${result.value.toISOString()}`);
	} else {
		console.error(`Error: ${result.error.message} (Code: ${result.error.code})`);
	}
	console.log("\n");
}

const fromDate = new Date("2024-03-10T15:00:00.000Z"); // A Sunday

console.log("Usage examples for parseSchedule\n");

// 1. Interval Schedule
const intervalSchedule: Schedule = { type: "interval", interval: 3600000 }; // 1 hour
runExample("1. Interval Schedule (1 hour)", intervalSchedule, fromDate);

// 2. Daily Schedule (time has passed)
const dailySchedulePassed: Schedule = { type: "daily", time: "10:00" };
runExample("2. Daily Schedule (time has passed)", dailySchedulePassed, fromDate);

// 3. Daily Schedule (future time)
const dailyScheduleFuture: Schedule = { type: "daily", time: "18:00" };
runExample("3. Daily Schedule (future time)", dailyScheduleFuture, fromDate);

// 4. Weekly Schedule
const weeklySchedule: Schedule = { type: "weekly", dayOfWeek: 2, time: "09:30" }; // Tuesday at 9:30 AM
runExample("4. Weekly Schedule (Tuesday)", weeklySchedule, fromDate);

// 5. Cron Schedule (every day at 8 PM)
const cronSchedule: Schedule = { type: "cron", expression: "0 20 * * *" };
runExample("5. Cron Schedule (Daily at 8 PM)", cronSchedule, fromDate);

// 6. Invalid Schedule (missing required property)
const invalidInterval: Schedule = { type: "interval" };
runExample("6. Invalid Interval (missing interval)", invalidInterval, fromDate);
