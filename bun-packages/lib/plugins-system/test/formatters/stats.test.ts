import { describe, expect, it } from "vitest";
import type { PluginPerformanceStats } from "../../src/types";
import { formatStats } from "../../src/utils/format.utils";

describe("Format Utils - formatStats", () => {
	it("should format performance statistics", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 10,
			enabledPlugins: 7,
			errorPlugins: 1,
			averageLoadTime: 123.456,
			averageInitTime: 78.901,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("📊 Plugin Statistics");
		expect(formatted).toContain("Total Plugins: 10");
		expect(formatted).toContain("Enabled: 7");
		expect(formatted).toContain("Errors: 1");
		expect(formatted).toContain("Avg Load Time: 123.46ms");
		expect(formatted).toContain("Avg Init Time: 78.90ms");
	});

	it("should format stats with zero values", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 0,
			enabledPlugins: 0,
			errorPlugins: 0,
			averageLoadTime: 0,
			averageInitTime: 0,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("Total Plugins: 0");
		expect(formatted).toContain("Avg Load Time: 0.00ms");
	});

	it("should round average times to 2 decimal places", () => {
		const stats: PluginPerformanceStats = {
			totalPlugins: 5,
			enabledPlugins: 5,
			errorPlugins: 0,
			averageLoadTime: 123.456789,
			averageInitTime: 78.901234,
		};

		const formatted = formatStats(stats);

		expect(formatted).toContain("Avg Load Time: 123.46ms");
		expect(formatted).toContain("Avg Init Time: 78.90ms");
	});
});
