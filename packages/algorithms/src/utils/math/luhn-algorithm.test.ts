import { describe, expect, it } from "vitest";
import { luhnCheck } from "./luhn-algorithm";

describe("luhnCheck", () => {
	it("should return true for a valid number string", () => {
		expect(luhnCheck("79927398713")).toBe(true);
	});

	it("should return true for a valid number string with spaces", () => {
		expect(luhnCheck("7992 7398 713")).toBe(true);
	});

	it("should return false for an invalid number string", () => {
		expect(luhnCheck("79927398714")).toBe(false);
	});

	it("should return false for a string with non-digit characters", () => {
		expect(luhnCheck("799273a8713")).toBe(false);
	});

	it("should return false for an empty string", () => {
		expect(luhnCheck("")).toBe(false);
	});

	it("should handle a single digit string", () => {
		expect(luhnCheck("0")).toBe(true); // sum is 0, 0 % 10 === 0
		expect(luhnCheck("5")).toBe(false); // sum is 5
		expect(luhnCheck("9")).toBe(false); // sum is 9
	});
});
