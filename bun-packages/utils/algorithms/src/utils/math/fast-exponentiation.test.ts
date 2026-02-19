import { describe, expect, it } from "vitest";
import { fastExponentiation } from "./fast-exponentiation";

describe("fastExponentiation", () => {
	it("should calculate power correctly", () => {
		expect(fastExponentiation(2, 10)).toBe(1024);
		expect(fastExponentiation(3, 5)).toBe(243);
	});

	it("should handle exponent of 0", () => {
		expect(fastExponentiation(5, 0)).toBe(1);
	});

	it("should handle base of 0", () => {
		expect(fastExponentiation(0, 5)).toBe(0);
	});
});
