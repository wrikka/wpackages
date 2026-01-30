/**
 * Tests for parser service
 */

import { describe, expect, it } from "vitest";
import { parseSource } from "./parser.service";

describe("ParserService", () => {
	it("should be exported from parser", () => {
		expect(parseSource).toBeDefined();
		expect(typeof parseSource).toBe("function");
	});

	it("should have parseSource function", () => {
		expect(parseSource).toBeDefined();
	});
});
