import { describe, expect, it } from "vitest";
import { primeFactorization } from "./prime-factorization";

describe("primeFactorization", () => {
	it("should find prime factors correctly", () => {
		expect(primeFactorization(84)).toEqual([2, 2, 3, 7]);
		expect(primeFactorization(100)).toEqual([2, 2, 5, 5]);
	});

	it("should handle prime numbers", () => {
		expect(primeFactorization(13)).toEqual([13]);
	});

	it("should handle 1", () => {
		expect(primeFactorization(1)).toEqual([]);
	});
});
