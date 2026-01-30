import { describe, it, expect } from "vitest";
import { formatIntro, formatSuccess, formatError, formatOutro } from "./display";

describe("display components", () => {
	it("should format intro message", () => {
		expect(formatIntro("test")).toContain("✨");
		expect(formatIntro("test")).toContain("test");
	});

	it("should format success message", () => {
		expect(formatSuccess("done")).toContain("✅");
		expect(formatSuccess("done")).toContain("done");
	});

	it("should format error message", () => {
		expect(formatError("fail")).toContain("❌");
		expect(formatError("fail")).toContain("fail");
	});

	it("should format outro message", () => {
		expect(formatOutro("All done")).toContain("✨");
		expect(formatOutro("All done")).toContain("All done");
	});
});
