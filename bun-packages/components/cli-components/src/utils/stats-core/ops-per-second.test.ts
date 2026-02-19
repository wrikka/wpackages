import { describe, expect, it } from "vitest";
import { opsPerSecond } from "../stats-core";

describe("opsPerSecond", () => {
	it("should calculate ops per second from milliseconds", () => {
		expect(opsPerSecond(1)).toBe(1000);
		expect(opsPerSecond(10)).toBe(100);
		expect(opsPerSecond(100)).toBe(10);
	});

	it("should handle zero", () => {
		expect(opsPerSecond(0)).toBe(0);
	});

	it("should handle very small times (fast operations)", () => {
		expect(opsPerSecond(0.1)).toBe(10000);
		expect(opsPerSecond(0.01)).toBe(100000);
	});

	it("should handle decimal times", () => {
		expect(opsPerSecond(2.5)).toBe(400);
	});
});
