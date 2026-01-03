import { describe, expect, it } from "vitest";
import type { Schedule } from "../types";
import { parseSchedule } from "./scheduler";

// Helper to check for success and unwrap value
const unwrap = <E, A>(result: { _tag: "Success"; value: A } | { _tag: "Failure"; error: E }): A => {
	if (result._tag === "Failure") {
		throw new Error(`Test failed: expected success but got failure with error: ${JSON.stringify(result.error)}`);
	}
	return result.value;
};

describe("parseSchedule", () => {
	const fromDate = new Date("2024-01-15T10:00:00.000Z"); // Monday

	it("should handle 'once' schedule", () => {
		const schedule: Schedule = { type: "once" };
		const result = parseSchedule(schedule, fromDate);
		expect(result._tag).toBe("Success");
		expect(unwrap(result)).toEqual(fromDate);
	});

	describe("interval schedule", () => {
		it("should calculate next run time for 'interval' schedule", () => {
			const schedule: Schedule = { type: "interval", interval: 60000 }; // 1 minute
			const result = parseSchedule(schedule, fromDate);
			const expectedDate = new Date(fromDate.getTime() + 60000);
			expect(result._tag).toBe("Success");
			expect(unwrap(result)).toEqual(expectedDate);
		});

		it("should return error if interval is missing", () => {
			const schedule: Schedule = { type: "interval" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_INTERVAL");
		});
	});

	describe("daily schedule", () => {
		it("should schedule for a future time on the same day", () => {
			const schedule: Schedule = { type: "daily", time: "14:30" };
			const result = parseSchedule(schedule, fromDate);
			const expectedDate = new Date("2024-01-15T14:30:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should schedule for the next day if time has passed", () => {
			const schedule: Schedule = { type: "daily", time: "08:00" };
			const result = parseSchedule(schedule, fromDate);
			const expectedDate = new Date("2024-01-16T08:00:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should return error for invalid time format", () => {
			const schedule: Schedule = { type: "daily", time: "invalid-time" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_TIME_FORMAT");
		});

		it("should return error if time is missing", () => {
			const schedule: Schedule = { type: "daily" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_TIME");
		});
	});

	describe("weekly schedule", () => {
		it("should schedule for a future day in the same week", () => {
			// fromDate is Monday (1), schedule for Wednesday (3)
			const schedule: Schedule = { type: "weekly", dayOfWeek: 3, time: "15:00" };
			const result = parseSchedule(schedule, fromDate);
			const expectedDate = new Date("2024-01-17T15:00:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should schedule for the next week if day has passed", () => {
			// fromDate is Monday (1), schedule for Sunday (0)
			const schedule: Schedule = { type: "weekly", dayOfWeek: 0, time: "09:00" };
			const result = parseSchedule(schedule, fromDate);
			const expectedDate = new Date("2024-01-21T09:00:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should return error for invalid day of week", () => {
			const schedule: Schedule = { type: "weekly", dayOfWeek: 7 };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_DAY");
		});

		it("should return error if dayOfWeek is missing", () => {
			const schedule: Schedule = { type: "weekly" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_DAY");
		});
	});

	describe("cron schedule", () => {
		it("should parse a simple daily cron expression", () => {
			const schedule: Schedule = { type: "cron", expression: "30 12 * * *" }; // 12:30 every day
			const result = parseSchedule(schedule, fromDate); // from is 10:00
			const expectedDate = new Date("2024-01-15T12:30:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should parse a cron for the next day if time has passed", () => {
			const schedule: Schedule = { type: "cron", expression: "30 09 * * *" }; // 09:30 every day
			const result = parseSchedule(schedule, fromDate); // from is 10:00
			const expectedDate = new Date("2024-01-16T09:30:00.000Z");
			expect(result._tag).toBe("Success");
			expect(unwrap(result).toISOString()).toBe(expectedDate.toISOString());
		});

		it("should return error for invalid cron format", () => {
			const schedule: Schedule = { type: "cron", expression: "* * *" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_CRON_FORMAT");
		});

		it("should return error if expression is missing", () => {
			const schedule: Schedule = { type: "cron" };
			const result = parseSchedule(schedule, fromDate);
			expect(result._tag).toBe("Failure");
			expect(result.error.code).toBe("INVALID_CRON");
		});
	});

	it("should return error for unknown schedule type", () => {
		const schedule: Schedule = { type: "unknown" as any };
		const result = parseSchedule(schedule, fromDate);
		expect(result._tag).toBe("Failure");
		expect(result.error.code).toBe("UNKNOWN_TYPE");
	});
});
