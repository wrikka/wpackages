import { describe, expect, it } from "vitest";
import { ZERO_POINT } from "./point";
import { IDENTITY_TRANSFORM } from "./transform";

describe("IDENTITY_TRANSFORM", () => {
	it("should have correct identity values", () => {
		expect(IDENTITY_TRANSFORM.rotate).toBe(0);
		expect(IDENTITY_TRANSFORM.scale).toBe(1);
		expect(IDENTITY_TRANSFORM.translate).toBe(ZERO_POINT);
	});

	it("should be frozen", () => {
		expect(Object.isFrozen(IDENTITY_TRANSFORM)).toBe(true);
	});
});
