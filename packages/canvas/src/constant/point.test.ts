import { describe, expect, it } from "vitest";
import { ZERO_POINT } from "./point";

describe("ZERO_POINT", () => {
	it("should have x and y coordinates as 0", () => {
		expect(ZERO_POINT.x).toBe(0);
		expect(ZERO_POINT.y).toBe(0);
	});

	it("should be frozen", () => {
		expect(Object.isFrozen(ZERO_POINT)).toBe(true);
	});
});
