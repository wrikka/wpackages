import { describe, expect, it } from "vitest";
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "./zoom";

describe("Zoom constants", () => {
	it("should have correct zoom values", () => {
		expect(MIN_ZOOM).toBe(0.1);
		expect(MAX_ZOOM).toBe(10);
		expect(DEFAULT_ZOOM).toBe(1);
	});

	it("should have valid range", () => {
		expect(MIN_ZOOM).toBeLessThan(DEFAULT_ZOOM);
		expect(DEFAULT_ZOOM).toBeLessThan(MAX_ZOOM);
	});
});
