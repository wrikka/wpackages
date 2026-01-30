import { describe, expect, it } from "vitest";
import { modularExponentiation } from "./modular-exponentiation";

describe("modularExponentiation", () => {
	it("should calculate modular exponentiation correctly", () => {
		expect(modularExponentiation(2, 10, 1000)).toBe(24);
		expect(modularExponentiation(3, 5, 100)).toBe(43);
	});

	it("should handle modulus of 1", () => {
		expect(modularExponentiation(5, 10, 1)).toBe(0);
	});
});
