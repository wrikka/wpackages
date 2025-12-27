import { isFailure, isSuccess } from "functional";
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
			const resultValue = parseCronExpression("* * * * *");

			expect(isSuccess(resultValue)).toBe(true);
			expect(resultValue).toEqual({
				_tag: "Success",
				value: {
					seconds: 0,
					minutes: 1,
					hours: 0,
					days: 0,
				},
			});
		});

		it("should return error for invalid cron expressions", () => {
			const resultValue = parseCronExpression("* * * *");
			expect(isFailure(resultValue)).toBe(true);
		});
	});
});
