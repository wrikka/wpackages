import { describe, expect, it } from "vitest";
import { huffmanCoding } from "./huffman-coding";

describe("huffmanCoding", () => {
	it("should correctly encode a simple string", () => {
		const text = "BCAADDDCCACACAC"; // Frequencies: C=5, A=5, D=3, B=1
		const result = huffmanCoding(text);
		const codes = result!.codes;

		// Check that characters with higher frequency have shorter or equal length codes
		expect(codes['C'].length).toBeLessThanOrEqual(codes['D'].length);
		expect(codes['A'].length).toBeLessThanOrEqual(codes['D'].length);
		expect(codes['D'].length).toBeLessThanOrEqual(codes['B'].length);

		// Re-encode the string with the generated codes to verify correctness
		const expectedEncodedString = text.split('').map(char => codes[char]).join('');
		expect(result!.encodedString).toBe(expectedEncodedString);
	});

	it("should handle a string with a single character", () => {
		const text = "aaaaa";
		const result = huffmanCoding(text);
		expect(result).not.toBeNull();
		expect(result!.codes).toEqual({ a: "0" });
		expect(result!.encodedString).toBe("00000");
	});

	it("should handle an empty string", () => {
		const text = "";
		const result = huffmanCoding(text);
		expect(result).toEqual({ codes: {}, encodedString: "" });
	});

	it("should handle a string with all unique characters", () => {
		const text = "abcdefg";
		const result = huffmanCoding(text);
		expect(result).not.toBeNull();
		// The exact codes can vary, but let's check the structure
		expect(Object.keys(result!.codes).length).toBe(7);
		expect(result!.encodedString.length).toBeGreaterThan(7);
	});
});
