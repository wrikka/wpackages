import { describe, expect, it } from "vitest";
import { randomBoolean, randomChoice, randomFloat, randomInt, randomString, randomUUID } from "./random";

describe("randomInt", () => {
	it("should return integer within range", () => {
		const result = randomInt(1, 10);
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThanOrEqual(10);
		expect(Number.isInteger(result)).toBe(true);
	});

	it("should handle reversed range", () => {
		const result = randomInt(10, 1);
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThanOrEqual(10);
	});
});

describe("randomFloat", () => {
	it("should return float within range", () => {
		const result = randomFloat(1.5, 10.5);
		expect(result).toBeGreaterThanOrEqual(1.5);
		expect(result).toBeLessThanOrEqual(10.5);
	});
});

describe("randomChoice", () => {
	it("should return element from array", () => {
		const array = [1, 2, 3, 4, 5];
		const result = randomChoice(array);
		expect(array).toContain(result);
	});

	it("should throw on empty array", () => {
		expect(() => randomChoice([])).toThrow("Cannot choose from empty array");
	});
});

describe("randomString", () => {
	it("should generate string of correct length", () => {
		const result = randomString(10);
		expect(result.length).toBe(10);
	});

	it("should use custom charset", () => {
		const result = randomString(5, "ABC");
		expect(result).toMatch(/^[ABC]{5}$/);
	});
});

describe("randomBoolean", () => {
	it("should return boolean", () => {
		const result = randomBoolean();
		expect(typeof result).toBe("boolean");
	});
});

describe("randomUUID", () => {
	it("should generate valid UUID format", () => {
		const result = randomUUID();
		expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
	});
});
