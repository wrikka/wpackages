import { describe, expect, it } from "vitest";
import { CountMinSketch } from "./count-min-sketch";

describe("CountMinSketch", () => {
	it("should count frequencies", () => {
		const cms = new CountMinSketch(1000, 5);
		cms.add("a");
		cms.add("a");
		cms.add("b");
		expect(cms.count("a")).toBeGreaterThanOrEqual(2);
		expect(cms.count("b")).toBeGreaterThanOrEqual(1);
	});

	it("should return 0 for non-existent items", () => {
		const cms = new CountMinSketch(1000, 5);
		expect(cms.count("x")).toBe(0);
	});
});
