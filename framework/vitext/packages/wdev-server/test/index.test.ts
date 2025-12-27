import { describe, expect, it } from "vitest";
import wdev from "../src";

describe("wdev plugin", () => {
	it("should return an array of plugins", () => {
		const plugins = wdev();
		expect(Array.isArray(plugins)).toBe(true);
	});

	it("should include unocss plugin when style is configured", () => {
		const plugins = wdev({ style: {} });
		const unocssPlugin = plugins.find(
			(p) =>
				p &&
				"name" in p &&
				typeof p.name === "string" &&
				p.name.startsWith("unocss"),
		);
		expect(unocssPlugin).toBeDefined();
	});

	it("should include icons plugin when icon is configured", () => {
		const plugins = wdev({ icon: [] });
		const iconsPlugin = plugins.find(
			(p) => p && "name" in p && p.name === "unplugin-icons",
		);
		expect(iconsPlugin).toBeDefined();
	});

	it("should include command plugin for lint", () => {
		const plugins = wdev({ lint: { biome: { scripts: "test" } } });
		const lintPlugin = plugins.find(
			(p) => p && "name" in p && p.name === "vite-plugin-wdev-lint",
		);
		expect(lintPlugin).toBeDefined();
	});
});
