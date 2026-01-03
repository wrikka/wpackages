import { describe, expect, it } from "vitest";
import { formatDate } from "../../src/utils/format.utils";

describe("Format Utils - formatDate", () => {
	it("should format date to locale string", () => {
		const date = new Date("2024-01-01T12:00:00Z");
		const formatted = formatDate(date);

		expect(formatted).toBe(date.toLocaleString());
	});

	it("should handle different dates", () => {
		const date1 = new Date("2024-01-01T00:00:00Z");
		const date2 = new Date("2024-12-31T23:59:59Z");

		expect(formatDate(date1)).not.toBe(formatDate(date2));
	});
});
