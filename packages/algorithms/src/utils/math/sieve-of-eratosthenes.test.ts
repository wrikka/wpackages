import { describe, expect, it } from "vitest";
import { sieveOfEratosthenes } from "./sieve-of-eratosthenes";

describe("sieveOfEratosthenes", () => {
	it("should find all prime numbers up to a given number", () => {
		expect(sieveOfEratosthenes(10)).toEqual([2, 3, 5, 7]);
		expect(sieveOfEratosthenes(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
	});

	it("should return an empty array for n < 2", () => {
		expect(sieveOfEratosthenes(1)).toEqual([]);
		expect(sieveOfEratosthenes(0)).toEqual([]);
		expect(sieveOfEratosthenes(-10)).toEqual([]);
	});

	it("should handle the case n = 2", () => {
		expect(sieveOfEratosthenes(2)).toEqual([2]);
	});
});
