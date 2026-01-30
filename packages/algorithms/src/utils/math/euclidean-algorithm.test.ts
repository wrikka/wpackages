import { describe, expect, it } from "vitest";
import { euclideanAlgorithm } from "./euclidean-algorithm";

describe("euclideanAlgorithm", () => {
	it("should find the greatest common divisor of two positive integers", () => {
		expect(euclideanAlgorithm(48, 18)).toBe(6);
		expect(euclideanAlgorithm(101, 103)).toBe(1); // Coprime
	});

	it("should handle cases where one number is zero", () => {
		expect(euclideanAlgorithm(10, 0)).toBe(10);
		expect(euclideanAlgorithm(0, 5)).toBe(5);
		expect(euclideanAlgorithm(0, 0)).toBe(0);
	});

	it("should handle negative numbers by taking their absolute value", () => {
		expect(euclideanAlgorithm(-48, 18)).toBe(6);
		expect(euclideanAlgorithm(48, -18)).toBe(6);
		expect(euclideanAlgorithm(-48, -18)).toBe(6);
	});

	it("should handle cases where one number is a multiple of the other", () => {
		expect(euclideanAlgorithm(100, 10)).toBe(10);
		expect(euclideanAlgorithm(7, 49)).toBe(7);
	});
});
