import { describe, expect, it } from "vitest";
import { GRID_SIZE, SNAP_THRESHOLD } from "./grid";

describe("Grid constants", () => {
	it("should have correct grid size", () => {
		expect(GRID_SIZE).toBe(20);
	});

	it("should have correct snap threshold", () => {
		expect(SNAP_THRESHOLD).toBe(5);
	});

	it("snap threshold should be less than grid size", () => {
		expect(SNAP_THRESHOLD).toBeLessThan(GRID_SIZE);
	});
});
