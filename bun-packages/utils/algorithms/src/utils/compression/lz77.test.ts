import { describe, expect, it } from "vitest";
import { lz77Coding } from "./lz77";

describe("lz77Coding", () => {
	it("should correctly encode and decode a simple string", () => {
		const text = "ababababab";
		const result = lz77Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle a string with repeated patterns", () => {
		const text = "abcabcabcabc";
		const result = lz77Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle an empty string", () => {
		const text = "";
		const result = lz77Coding(text);
		expect(result.decoded).toBe("");
	});

	it("should handle a string with no repetition", () => {
		const text = "abcdef";
		const result = lz77Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should produce encoded tokens with valid structure", () => {
		const text = "ababab";
		const result = lz77Coding(text);
		for (const token of result.encoded) {
			expect(token).toHaveProperty("offset");
			expect(token).toHaveProperty("length");
			expect(token).toHaveProperty("char");
		}
	});
});
