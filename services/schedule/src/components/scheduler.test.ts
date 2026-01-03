import { describe, expect, it } from "vitest";
import type { ScheduleConfig } from "../types/index";
import { createScheduleDisplay, formatCronExpression } from "./scheduler";

describe("scheduler component", () => {
	describe("createScheduleDisplay", () => {
		it("should create a display string for a schedule config", () => {
			const config: ScheduleConfig = {
				name: "test-schedule",
				enabled: true,
				timezone: "America/New_York",
			};

			const result = createScheduleDisplay(config);
			expect(result).toBe(
				"Schedule: test-schedule | Status: Enabled | Timezone: America/New_York",
			);
		});

		it("should handle missing name and timezone", () => {
			const config: ScheduleConfig = {
				name: "",
				enabled: false,
			};

			const result = createScheduleDisplay(config);
			expect(result).toBe(
				"Schedule: Unnamed Schedule | Status: Disabled | Timezone: UTC",
			);
		});
	});

	describe("formatCronExpression", () => {
		it("should format valid cron expressions", () => {
			const result = formatCronExpression("* * * * *");
			expect(result).toBe(
				"Runs every minute, every hour, every day, every month, every weekday",
			);
		});

		it("should handle invalid cron expressions", () => {
			const result = formatCronExpression("* * * *");
			expect(result).toBe("Invalid cron expression");
		});

		it("should format specific cron expressions", () => {
			const result = formatCronExpression("0 0 * * *");
			expect(result).toBe(
				"Runs at minute 0, at hour 0, every day, every month, every weekday",
			);
		});
	});
});
