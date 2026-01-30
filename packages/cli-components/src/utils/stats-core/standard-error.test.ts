import { describe, expect, it } from "vitest";
import { standardError } from "../stats-core";

describe("standardError", () => {
	it("should calculate standard error", () => {
		const result = standardError([1, 2, 3, 4, 5]);
		expect(result).toBeGreaterThan(0);
	});

	it("should handle empty array", () => {
		expect(standardError([])).toBe(0);
	});

	it("should decrease with larger sample size", () => {
		const smallSample = standardError([1, 2, 3]);
		const largeSample = standardError([1, 2, 3, 1, 2, 3, 1, 2, 3]);
		expect(smallSample).toBeGreaterThan(largeSample);
	});
});
