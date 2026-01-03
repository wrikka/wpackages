import { Effect, Exit } from "effect";
import { describe, expect, it } from "vitest";
import { parseCronExpression, validateCronExpression } from "./cron-parser";

describe("cron-parser", () => {
	describe("validateCronExpression", () => {
		it("should validate correct cron expressions", () => {
			expect(validateCronExpression("* * * * *")).toBe(true);
			expect(validateCronExpression("0 0 * * *")).toBe(true);
			expect(validateCronExpression("*/5 * * * *")).toBe(true);
		});

		it("should reject invalid cron expressions", () => {
			expect(validateCronExpression("* * * *")).toBe(false);
			expect(validateCronExpression("* * * * * *")).toBe(false);
			expect(validateCronExpression("")).toBe(false);
		});
	});

	describe("parseCronExpression", () => {
		it("should parse valid cron expressions", () => {
			const exit = Effect.runSyncExit(parseCronExpression("* * * * *"));
			if (Exit.isFailure(exit)) {
				throw new Error("Expected parseCronExpression to succeed");
			}
			expect(exit.value).toEqual({
				seconds: 0,
				minutes: 1,
				hours: 0,
				days: 0,
			});
		});

		it("should return error for invalid cron expressions", () => {
			const exit = Effect.runSyncExit(parseCronExpression("* * * *"));
			if (Exit.isSuccess(exit)) {
				throw new Error("Expected parseCronExpression to fail");
			}
		});
	});
});
