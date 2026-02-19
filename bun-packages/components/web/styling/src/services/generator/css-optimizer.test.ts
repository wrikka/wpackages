import { describe, expect, it } from "vitest";
import { optimizeCss } from "../services/generator/css-optimizer";

describe("optimizeCss", () => {
	it("should deduplicate CSS rules", () => {
		const css = `
			.p-4 { padding: 1rem; }
			.p-4 { padding: 1rem; }
		`;
		const result = optimizeCss(css, { deduplicate: true });

		expect(result.css).toContain(".p-4");
		expect(result.stats.originalSize).toBeGreaterThan(result.stats.optimizedSize);
	});

	it("should merge media queries", () => {
		const css = `
			@media (min-width: 768px) { .p-4 { padding: 1rem; } }
			@media (min-width: 768px) { .m-2 { margin: 0.5rem; } }
		`;
		const result = optimizeCss(css, { mergeMediaQueries: true });

		expect(result.css).toContain("@media (min-width: 768px)");
	});

	it("should sort selectors", () => {
		const css = `
			.z-10 { z-index: 10; }
			.a-1 { z-index: 1; }
		`;
		const result = optimizeCss(css, { sortSelectors: true });

		const lines = result.css.split("\n");
		const aIndex = lines.findIndex(line => line.includes(".a-1"));
		const zIndex = lines.findIndex(line => line.includes(".z-10"));

		expect(aIndex).toBeLessThan(zIndex);
	});

	it("should handle empty CSS", () => {
		const result = optimizeCss("");

		expect(result.css).toBe("");
		expect(result.stats.originalSize).toBe(0);
		expect(result.stats.optimizedSize).toBe(0);
	});

	it("should calculate reduction percentage", () => {
		const css = `
			.p-4 { padding: 1rem; }
			.p-4 { padding: 1rem; }
			.m-2 { margin: 0.5rem; }
		`;
		const result = optimizeCss(css, { deduplicate: true });

		expect(result.stats.reductionPercent).toBeGreaterThan(0);
	});
});
