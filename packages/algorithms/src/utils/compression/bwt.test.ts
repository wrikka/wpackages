import { describe, expect, it } from "vitest";
import { bwtCoding } from "./bwt";

describe("bwtCoding", () => {
	it("should correctly encode and decode a simple string", () => {
		const text = "banana";
		const result = bwtCoding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle a string with repeated patterns", () => {
		const text = "ababababab";
		const result = bwtCoding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle an empty string", () => {
		const text = "";
		const result = bwtCoding(text);
		expect(result.decoded).toBe("");
	});

	it("should handle a string with no repetition", () => {
		const text = "abcdef";
		const result = bwtCoding(text);
		expect(result.decoded).toBe(text);
	});

	it("should produce valid encoded structure", () => {
		const text = "banana";
		const result = bwtCoding(text);
		expect(result.encoded).toHaveProperty("transformed");
		expect(result.encoded).toHaveProperty("index");
		expect(result.encoded.transformed.length).toBe(text.length);
	});
});
