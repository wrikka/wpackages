import { describe, it, expect } from "vitest";
import { string } from "../src/utils/primitives/string";

describe("string schema", () => {
	it("should parse a valid string", () => {
		const schema = string();
		const result = schema.parse("hello");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBe("hello");
		}
	});

	it("should fail for a non-string value", () => {
		const schema = string();
		const result = schema.parse(123);
		expect(result.success).toBe(false);
	});

	it("should handle min length validation", () => {
		const schema = string({ min: 5 });
		const result = schema.parse("hi");
		expect(result.success).toBe(false);
	});
});
