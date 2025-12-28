import { describe, expect, it } from "vitest";
import wserver from "./plugin";

describe("wserver plugin", () => {
	it("should return a Vite plugin object", () => {
		const plugin = wserver({});
		expect(plugin).toBeTypeOf("object");
		expect(plugin.name).toBe("vite-plugin-wserver");
		expect(plugin.apply).toBe("serve");
		expect(plugin.configureServer).toBeTypeOf("function");
	});
});
