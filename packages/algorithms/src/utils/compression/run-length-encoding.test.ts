import { describe, expect, it } from "vitest";
import { runLengthEncoding, runLengthDecoding } from "./run-length-encoding";

describe("runLengthEncoding", () => {
	it("should encode and decode correctly", () => {
		const text = "AAAABBBCCDAA";
		const encoded = runLengthEncoding(text);
		const decoded = runLengthDecoding(encoded);
		expect(decoded).toBe(text);
	});

	it("should handle empty string", () => {
		expect(runLengthEncoding("")).toBe("");
	});

	it("should handle single character", () => {
		expect(runLengthEncoding("A")).toBe("A1");
	});
});
