import { describe, expect, it } from "vitest";
import { filterScriptsByName, formatScriptResult, isValidScript, sortScriptsByDependencies } from "./script-utils";

describe("Script Utilities", () => {
	describe("isValidScript", () => {
		it("should validate correct script", () => {
			const script = {
				name: "test",
				command: "echo test",
			};
			expect(isValidScript(script)).toBe(true);
		});

		it("should reject invalid scripts", () => {
			expect(isValidScript(null)).toBe(false);
			expect(isValidScript({})).toBe(false);
			expect(isValidScript({ name: "test" })).toBe(false);
			expect(isValidScript({ command: "echo test" })).toBe(false);
			expect(isValidScript({ name: "", command: "echo test" })).toBe(false);
			expect(isValidScript({ name: "test", command: "" })).toBe(false);
		});
	});

	describe("formatScriptResult", () => {
		it("should format successful script result", () => {
			const result = {
				name: "test",
				success: true,
				output: "test output",
				duration: 100,
			} as any;

			const formatted = formatScriptResult(result);
			expect(formatted).toContain("✓ test (100ms)");
			expect(formatted).toContain("test output");
		});

		it("should format failed script result", () => {
			const result = {
				name: "test",
				success: false,
				error: "test error",
				duration: 100,
			} as any;

			const formatted = formatScriptResult(result);
			expect(formatted).toContain("✗ test (100ms)");
			expect(formatted).toContain("Error: test error");
		});
	});

	describe("sortScriptsByDependencies", () => {
		it("should sort scripts by dependencies", () => {
			const scripts = [
				{ name: "deploy", command: "deploy", dependencies: ["test"] },
				{ name: "test", command: "test", dependencies: ["build"] },
				{ name: "build", command: "build" },
			] as any;

			const sorted = sortScriptsByDependencies(scripts);

			expect(sorted[0].name).toBe("build");
			expect(sorted[1].name).toBe("test");
			expect(sorted[2].name).toBe("deploy");
		});

		it("should handle scripts with no dependencies", () => {
			const scripts = [
				{ name: "a", command: "a" },
				{ name: "b", command: "b" },
				{ name: "c", command: "c" },
			] as any;

			const sorted = sortScriptsByDependencies(scripts);
			expect(sorted).toHaveLength(3);
		});
	});

	describe("filterScriptsByName", () => {
		it("should filter scripts by name pattern", () => {
			const scripts = [
				{ name: "build-app", command: "build" },
				{ name: "build-lib", command: "build" },
				{ name: "test", command: "test" },
			] as any;

			const filtered = filterScriptsByName(scripts, "build");
			expect(filtered).toHaveLength(2);
			expect(filtered[0].name).toBe("build-app");
			expect(filtered[1].name).toBe("build-lib");
		});

		it("should return all scripts when no pattern provided", () => {
			const scripts = [
				{ name: "build", command: "build" },
				{ name: "test", command: "test" },
			] as any;

			const filtered = filterScriptsByName(scripts, "");
			expect(filtered).toHaveLength(2);
		});
	});
});
