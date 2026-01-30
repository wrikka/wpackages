import { describe, it, expect } from "vitest";
import { ensureArray } from "./array";

describe("ensureArray", () => {
	it("should wrap single value in array", () => {
		expect(ensureArray("test")).toEqual(["test"]);
	});

	it("should return array as-is", () => {
		expect(ensureArray(["a", "b"])).toEqual(["a", "b"]);
	});
});
