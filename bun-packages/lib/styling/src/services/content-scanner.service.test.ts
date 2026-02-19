import { describe, expect, it } from "vitest";
import { collectClassesFromContent } from "./content-scanner.service";

describe("collectClassesFromContent", () => {
	it("should collect classes from content files", async () => {
		const result = await collectClassesFromContent({
			patterns: ["examples/vite-vue/src/**/*.vue"],
			cwd: process.cwd(),
			mode: ["class"],
		});

		expect(result.size).toBeGreaterThan(0);
	});

	it("should collect classes with attributify mode", async () => {
		const result = await collectClassesFromContent({
			patterns: ["examples/vite-vue/src/**/*.vue"],
			cwd: process.cwd(),
			mode: ["class", "attributify"],
		});

		expect(result.size).toBeGreaterThan(0);
	});

	it("should handle empty patterns", async () => {
		const result = await collectClassesFromContent({
			patterns: [],
			cwd: process.cwd(),
		});

		expect(result.size).toBe(0);
	});
});
