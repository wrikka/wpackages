import { describe, expect, it } from "vitest";
import { log } from "./mocks/log";

describe("log", () => {
	it("should generate log statement with source location", () => {
		const result = log("test message");
		expect(result).toContain("console.log");
	});

	it("should handle multiple arguments", () => {
		const result = log("test", 123, { key: "value" });
		expect(result).toContain("console.log");
	});
});
