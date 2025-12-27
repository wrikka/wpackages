import { describe, expect, it } from "vitest";
import { renderHelp, renderScriptInfo, renderScriptList, renderScriptResults } from "./cli";

describe("CLI Components", () => {
	it("should render script info", () => {
		const script = {
			name: "test",
			description: "Test script",
			command: "echo test",
			cwd: "/test",
			dependencies: ["build"],
			parallel: false,
		} as any;

		const result = renderScriptInfo(script);
		expect(result).toContain("Script: test");
		expect(result).toContain("Description: Test script");
		expect(result).toContain("Command: echo test");
		expect(result).toContain("Working Directory: /test");
		expect(result).toContain("Dependencies: build");
	});

	it("should render script results", () => {
		const results = [
			{
				name: "test",
				success: true,
				output: "test output",
				duration: 100,
			},
			{
				name: "fail",
				success: false,
				error: "test error",
				duration: 50,
			},
		] as any;

		const result = renderScriptResults(results);
		expect(result).toContain("Script Execution Results:");
		expect(result).toContain("✓ test (100ms)");
		expect(result).toContain("test output");
		expect(result).toContain("✗ fail (50ms)");
		expect(result).toContain("test error");
		expect(result).toContain("Summary: 1 succeeded, 1 failed");
	});

	it("should render script list", () => {
		const scripts = [
			{ name: "build", description: "Build project" },
			{ name: "test" },
		] as any;

		const result = renderScriptList(scripts);
		expect(result).toContain("Available Scripts:");
		expect(result).toContain("build - Build project");
		expect(result).toContain("test");
	});

	it("should render help", () => {
		const result = renderHelp();
		expect(result).toContain("Script Runner CLI");
		expect(result).toContain("Usage:");
		expect(result).toContain("Commands:");
		expect(result).toContain("Options:");
		expect(result).toContain("Examples:");
	});

	it("should handle empty script list", () => {
		const result = renderScriptList([]);
		expect(result).toBe("No scripts found.");
	});
});
