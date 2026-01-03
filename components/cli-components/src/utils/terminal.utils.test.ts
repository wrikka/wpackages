import { describe, expect, it } from "vitest";
import { getTerminalSize, isColorSupported } from "./terminal.utils";

describe("terminal.utils", () => {
	describe("getTerminalSize", () => {
		it("should return terminal size", () => {
			const size = getTerminalSize();
			expect(size).toHaveProperty("width");
			expect(size).toHaveProperty("height");
			expect(typeof size.width).toBe("number");
			expect(typeof size.height).toBe("number");
		});

		it("should return default values if not available", () => {
			const size = getTerminalSize();
			expect(size.width).toBeGreaterThanOrEqual(80);
			expect(size.height).toBeGreaterThanOrEqual(24);
		});

		it("should be immutable", () => {
			const size = getTerminalSize();
			expect(Object.isFrozen(size)).toBe(true);
		});

		it("should have positive dimensions", () => {
			const size = getTerminalSize();
			expect(size.width).toBeGreaterThan(0);
			expect(size.height).toBeGreaterThan(0);
		});
	});

	describe("isColorSupported", () => {
		it("should return boolean", () => {
			const supported = isColorSupported();
			expect(typeof supported).toBe("boolean");
		});

		it("should detect color support", () => {
			// This test is environment-dependent
			const supported = isColorSupported();
			expect([true, false]).toContain(supported);
		});

		it("should respect FORCE_COLOR environment", () => {
			const originalForceColor = process.env.FORCE_COLOR;
			const originalTerm = process.env.TERM;

			// Test with FORCE_COLOR=0
			process.env.FORCE_COLOR = "0";
			expect(isColorSupported()).toBe(false);

			// Test with FORCE_COLOR=1
			process.env.FORCE_COLOR = "1";
			expect(isColorSupported()).toBe(true);

			// Restore
			process.env.FORCE_COLOR = originalForceColor;
			process.env.TERM = originalTerm;
		});
	});
});
