import { describe, expect, it } from "vitest";
import { formatList, formatTable } from "../../src/utils/format.utils";

describe("Format Utils - Generic", () => {
	describe("formatList", () => {
		it("should format list of items", () => {
			const items = ["First item", "Second item", "Third item"];
			const formatted = formatList(items);

			expect(formatted).toBe(
				"  1. First item\n  2. Second item\n  3. Third item",
			);
		});

		it("should handle empty list", () => {
			const formatted = formatList([]);
			expect(formatted).toBe("");
		});

		it("should handle single item", () => {
			const formatted = formatList(["Only item"]);
			expect(formatted).toBe("  1. Only item");
		});
	});

	describe("formatTable", () => {
		it("should format table with headers and rows", () => {
			const headers = ["Name", "Status", "Version"];
			const rows = [
				["Plugin A", "Enabled", "1.0.0"],
				["Plugin B", "Disabled", "2.0.0"],
			];

			const formatted = formatTable(headers, rows);

			expect(formatted).toContain("Name");
			expect(formatted).toContain("Status");
			expect(formatted).toContain("Version");
			expect(formatted).toContain("Plugin A");
			expect(formatted).toContain("Enabled");
			expect(formatted).toContain("1.0.0");
			expect(formatted).toContain("Plugin B");
			expect(formatted).toContain("Disabled");
			expect(formatted).toContain("2.0.0");
		});

		it("should align columns properly", () => {
			const headers = ["ID", "Name"];
			const rows = [
				["1", "A"],
				["2", "B"],
			];

			const formatted = formatTable(headers, rows);
			const lines = formatted.split("\n");

			// Check that separator exists (with column separators)
			expect(lines[1]).toMatch(/^-+(\+-+)+$/);
		});

		it("should handle empty table", () => {
			const formatted = formatTable([], []);
			expect(formatted).toBe("");
		});

		it("should handle varying column widths", () => {
			const headers = ["Short", "Very Long Header"];
			const rows = [
				["X", "Y"],
				["A", "B"],
			];

			const formatted = formatTable(headers, rows);

			// Should not throw and should contain all data
			expect(formatted).toContain("Short");
			expect(formatted).toContain("Very Long Header");
			expect(formatted).toContain("X");
			expect(formatted).toContain("Y");
		});

		it("should handle missing cells in rows", () => {
			const headers = ["A", "B", "C"];
			const rows = [
				["1", "2"],
				["3", "4", "5"],
			];

			const formatted = formatTable(headers, rows);

			expect(formatted).toContain("A");
			expect(formatted).toContain("B");
			expect(formatted).toContain("C");
		});
	});
});
