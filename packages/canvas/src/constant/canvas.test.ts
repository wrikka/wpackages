import { describe, expect, it } from "vitest";
import { DEFAULT_CANVAS_SIZE } from "./canvas";

describe("DEFAULT_CANVAS_SIZE", () => {
	it("should have correct default dimensions", () => {
		expect(DEFAULT_CANVAS_SIZE.width).toBe(1920);
		expect(DEFAULT_CANVAS_SIZE.height).toBe(1080);
	});

	it("should be frozen", () => {
		expect(Object.isFrozen(DEFAULT_CANVAS_SIZE)).toBe(true);
	});
});
