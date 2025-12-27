import { describe, expect, it } from "vitest";
import { formatBytes, formatDuration } from "./format.utils";

describe("format.utils", () => {
	describe("formatDuration", () => {
		it("should format milliseconds", () => {
			expect(formatDuration(100)).toBe("100ms");
			expect(formatDuration(999)).toBe("999ms");
		});

		it("should format seconds", () => {
			expect(formatDuration(1000)).toBe("1.0s");
			expect(formatDuration(5500)).toBe("5.5s");
			expect(formatDuration(59999)).toBe("60.0s");
		});

		it("should format minutes", () => {
			expect(formatDuration(60000)).toBe("1m 0s");
			expect(formatDuration(90000)).toBe("1m 30s");
			expect(formatDuration(3599000)).toBe("59m 59s");
		});

		it("should format hours", () => {
			expect(formatDuration(3600000)).toBe("1h 0m");
			expect(formatDuration(7200000)).toBe("2h 0m");
			expect(formatDuration(5400000)).toBe("1h 30m");
		});
	});

	describe("formatBytes", () => {
		it("should format bytes", () => {
			expect(formatBytes(0)).toBe("0 B");
			expect(formatBytes(100)).toBe("100 B");
			expect(formatBytes(1023)).toBe("1023 B");
		});

		it("should format kilobytes", () => {
			expect(formatBytes(1024)).toBe("1.00 KB");
			expect(formatBytes(2048)).toBe("2.00 KB");
			expect(formatBytes(1536)).toBe("1.50 KB");
		});

		it("should format megabytes", () => {
			expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
			expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.50 MB");
		});

		it("should format gigabytes", () => {
			expect(formatBytes(1024 * 1024 * 1024)).toBe("1.00 GB");
			expect(formatBytes(1024 * 1024 * 1024 * 3.7)).toBe("3.70 GB");
		});

		it("should format terabytes", () => {
			expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1.00 TB");
			expect(formatBytes(1024 * 1024 * 1024 * 1024 * 5)).toBe("5.00 TB");
		});
	});
});
