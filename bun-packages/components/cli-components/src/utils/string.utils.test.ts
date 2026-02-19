import { describe, expect, it } from "vitest";
import { center, pad, stringWidth, stripAnsi, truncate, wrap } from "./string.utils";

describe("string.utils", () => {
	describe("truncate", () => {
		it("should truncate long strings", () => {
			expect(truncate("Hello World", 8)).toBe("Hello...");
		});

		it("should not truncate short strings", () => {
			expect(truncate("Hello", 10)).toBe("Hello");
		});

		it("should use custom ellipsis", () => {
			expect(truncate("Hello World", 8, "…")).toBe("Hello W…");
		});

		it("should handle exact length", () => {
			expect(truncate("Hello", 5)).toBe("Hello");
		});
	});

	describe("pad", () => {
		it("should pad string to width", () => {
			expect(pad("test", 8)).toBe("test    ");
		});

		it("should use custom character", () => {
			expect(pad("test", 8, "-")).toBe("test----");
		});

		it("should not pad if already at width", () => {
			expect(pad("test", 4)).toBe("test");
		});

		it("should not truncate if too long", () => {
			expect(pad("testing", 4)).toBe("testing");
		});
	});

	describe("center", () => {
		it("should center text", () => {
			expect(center("test", 10)).toBe("   test   ");
		});

		it("should handle odd widths", () => {
			expect(center("test", 9)).toBe("  test   ");
		});

		it("should not pad if text is too long", () => {
			expect(center("testing", 4)).toBe("testing");
		});

		it("should handle exact width", () => {
			expect(center("test", 4)).toBe("test");
		});
	});

	describe("stripAnsi", () => {
		it("should remove ANSI codes", () => {
			expect(stripAnsi("\x1b[31mRed\x1b[0m")).toBe("Red");
			expect(stripAnsi("\x1b[1;32mBold Green\x1b[0m")).toBe("Bold Green");
		});

		it("should handle strings without ANSI", () => {
			expect(stripAnsi("Plain text")).toBe("Plain text");
		});

		it("should handle multiple ANSI codes", () => {
			expect(stripAnsi("\x1b[31mRed\x1b[0m and \x1b[32mGreen\x1b[0m")).toBe(
				"Red and Green",
			);
		});
	});

	describe("stringWidth", () => {
		it("should calculate width without ANSI", () => {
			expect(stringWidth("\x1b[31mRed\x1b[0m")).toBe(3);
			expect(stringWidth("Plain text")).toBe(10);
		});

		it("should handle multiple ANSI codes", () => {
			expect(stringWidth("\x1b[31mRed\x1b[0m and \x1b[32mGreen\x1b[0m")).toBe(
				13,
			);
		});
	});

	describe("wrap", () => {
		it("should wrap text at max width", () => {
			const result = wrap("Hello world this is a test", 10);
			expect(result).toEqual(["Hello", "world this", "is a test"]);
		});

		it("should handle single words", () => {
			const result = wrap("Hello", 10);
			expect(result).toEqual(["Hello"]);
		});

		it("should handle long words", () => {
			const result = wrap("Supercalifragilisticexpialidocious", 10);
			expect(result).toEqual(["Supercalifragilisticexpialidocious"]);
		});

		it("should be immutable", () => {
			const result = wrap("Hello world", 10);
			expect(Object.isFrozen(result)).toBe(true);
		});

		it("should handle empty string", () => {
			const result = wrap("", 10);
			expect(result).toEqual([]);
		});
	});
});
