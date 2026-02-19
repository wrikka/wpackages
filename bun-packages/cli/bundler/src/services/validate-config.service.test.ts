import { describe, expect, it } from "@wpackages/test";
import { validateConfig } from "./validate-config.service";

describe("validateConfig", () => {
	it("throws when outDir missing", () => {
		expect(() =>
			validateConfig({
				entry: ["src/index.ts"],
			} as any)
		).toThrow();
	});

	it("accepts minimal valid config", () => {
		expect(() =>
			validateConfig({
				entry: ["src/index.ts"],
				outDir: ".output",
			} as any)
		).not.toThrow();
	});
});
