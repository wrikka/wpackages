import { describe, expect, it } from "vitest";
import { millerRabin } from "./miller-rabin";

describe("millerRabin", () => {
	it("should correctly identify primes", () => {
		expect(millerRabin(11)).toBe(true);
		expect(millerRabin(7919)).toBe(true);
	});

	it("should correctly identify composites", () => {
		expect(millerRabin(15)).toBe(false);
		expect(millerRabin(561)).toBe(false);
	});

	it("should handle edge cases", () => {
		expect(millerRabin(1)).toBe(false);
		expect(millerRabin(2)).toBe(true);
		expect(millerRabin(3)).toBe(true);
	});
});
