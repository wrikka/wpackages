import { describe, expect, it } from "vitest";
import { lz78Coding } from "./lz78";

describe("lz78Coding", () => {
	it("should correctly encode and decode a simple string", () => {
		const text = "ababababab";
		const result = lz78Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle a string with repeated patterns", () => {
		const text = "abcabcabcabc";
		const result = lz78Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should handle an empty string", () => {
		const text = "";
		const result = lz78Coding(text);
		expect(result.decoded).toBe("");
	});

	it("should handle a string with no repetition", () => {
		const text = "abcdef";
		const result = lz78Coding(text);
		expect(result.decoded).toBe(text);
	});

	it("should produce encoded tokens with valid structure", () => {
		const text = "ababab";
		const result = lz78Coding(text);
		for (const token of result.encoded) {
			expect(token).toHaveProperty("index");
			expect(token).toHaveProperty("char");
		}
	});
});
