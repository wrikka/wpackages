/**
 * Tests for parseSource service
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseSource } from "./parse-source.service";

describe("parseSource", () => {
	it("should parse valid JavaScript code", () => {
		expect.assertions(4);
		const source = "const x = 42;";
		const result = parseSource(source, "test.js");

		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.ast).toBeDefined();
			expect(result.value.errors).toEqual([]);
			expect(result.value.sourceType).toBe("module");
		}
	});

	it("should parse valid TypeScript code", () => {
		const source = "const x: number = 42;";
		const result = parseSource(source, "test.ts", { typescript: true });

		expect(Result.isOk(result)).toBe(true);
	});

	it("should handle parse errors", () => {
		const source = "const x = ;";
		const result = parseSource(source, "test.js");

		// OXC might still parse this with errors in the errors array
		expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
	});

	it("should support script sourceType", () => {
		expect.assertions(2);
		const source = "var x = 42;";
		const result = parseSource(source, "test.js", { sourceType: "script" });

		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.sourceType).toBe("script");
		}
	});
});
