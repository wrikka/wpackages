import { describe, expect, it } from "vitest";
import { shannonFanoCoding } from "./shannon-fano";

describe("shannonFanoCoding", () => {
	it("should correctly encode a simple string", () => {
		const text = "BCAADDDCCACACAC";
		const result = shannonFanoCoding(text);
		const codes = result!.codes;

		expect(Object.keys(codes).length).toBeGreaterThan(0);

		const expectedEncodedString = text.split('').map(char => codes[char]).join('');
		expect(result!.encodedString).toBe(expectedEncodedString);
	});

	it("should handle a string with a single character", () => {
		const text = "aaaaa";
		const result = shannonFanoCoding(text);
		expect(result).not.toBeNull();
		expect(result!.codes).toEqual({ a: "0" });
		expect(result!.encodedString).toBe("00000");
	});

	it("should handle an empty string", () => {
		const text = "";
		const result = shannonFanoCoding(text);
		expect(result).toEqual({ codes: {}, encodedString: "" });
	});

	it("should handle a string with all unique characters", () => {
		const text = "abcdefg";
		const result = shannonFanoCoding(text);
		expect(result).not.toBeNull();
		expect(Object.keys(result!.codes).length).toBe(7);
		expect(result!.encodedString.length).toBeGreaterThan(7);
	});
});
