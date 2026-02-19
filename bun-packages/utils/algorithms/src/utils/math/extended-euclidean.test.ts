import { describe, expect, it } from "vitest";
import { extendedEuclidean } from "./extended-euclidean";

describe("extendedEuclidean", () => {
	it("should find GCD and coefficients correctly", () => {
		const result = extendedEuclidean(35, 15);
		expect(result.gcd).toBe(5);
		expect(result.x * 35 + result.y * 15).toBe(5);
	});

	it("should handle coprime numbers", () => {
		const result = extendedEuclidean(14, 15);
		expect(result.gcd).toBe(1);
	});

	it("should handle zero", () => {
		const result = extendedEuclidean(5, 0);
		expect(result.gcd).toBe(5);
		expect(result.x).toBe(1);
		expect(result.y).toBe(0);
	});
});
