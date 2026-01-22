import { describe, expect, test, vi } from "vitest";
import * as O from "./output";

describe("output", () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		consoleWarnSpy.mockRestore();
	});

	describe("printSuccess", () => {
		test("should print success message", () => {
			O.printSuccess("Test message");
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("✓"), "Test message");
		});
	});

	describe("printError", () => {
		test("should print error message", () => {
			O.printError("Error message");
			expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("✗"), "Error message");
		});
	});

	describe("printWarning", () => {
		test("should print warning message", () => {
			O.printWarning("Warning message");
			expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("⚠"), "Warning message");
		});
	});

	describe("printInfo", () => {
		test("should print info message", () => {
			O.printInfo("Info message");
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("ℹ"), "Info message");
		});
	});

	describe("printCode", () => {
		test("should print code with language", () => {
			const code = "const x = 1;";
			O.printCode(code, "javascript");
			expect(consoleLogSpy).toHaveBeenCalled();
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("javascript"));
		});
	});

	describe("printConfidence", () => {
		test("should print high confidence", () => {
			O.printConfidence(0.9);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("90%"));
		});

		test("should print medium confidence", () => {
			O.printConfidence(0.5);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("50%"));
		});

		test("should print low confidence", () => {
			O.printConfidence(0.3);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("30%"));
		});
	});

	describe("printProgress", () => {
		test("should print progress message", () => {
			O.printProgress("Processing...");
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("→"), "Processing...");
		});
	});
});
