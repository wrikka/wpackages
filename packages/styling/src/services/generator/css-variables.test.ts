import { describe, expect, it } from "vitest";
import { generateCssVariables, resolveCssVariable, parseDynamicCssVariables, generateDynamicCssVariables } from "../services/generator/css-variables";

describe("generateCssVariables", () => {
	it("should generate CSS variables", () => {
		const result = generateCssVariables({
			prefix: "--app",
			variables: {
				primary: "#3b82f6",
				secondary: "#6366f1",
			},
		});

		expect(result).toContain("--app-primary: #3b82f6");
		expect(result).toContain("--app-secondary: #6366f1");
	});

	it("should generate theme variables", () => {
		const result = generateCssVariables({
			prefix: "--app",
			themeVariables: true,
		});

		expect(result).toContain("--app-color-primary");
		expect(result).toContain("--app-spacing-md");
	});

	it("should handle empty variables", () => {
		const result = generateCssVariables({
			prefix: "--app",
			variables: {},
		});

		expect(result).toContain(":root");
	});
});

describe("resolveCssVariable", () => {
	it("should resolve CSS variable", () => {
		const result = resolveCssVariable("primary");
		expect(result).toBe("var(--styling-primary)");
	});

	it("should resolve CSS variable with fallback", () => {
		const result = resolveCssVariable("primary", "#3b82f6");
		expect(result).toBe("var(--styling-primary, #3b82f6)");
	});

	it("should resolve CSS variable with custom prefix", () => {
		const result = resolveCssVariable("primary", "#3b82f6", "--app");
		expect(result).toBe("var(--app-primary, #3b82f6)");
	});
});

describe("parseDynamicCssVariables", () => {
	it("should parse dynamic CSS variables", () => {
		const classes = new Set(["[var-primary=#3b82f6]", "[var-secondary=#6366f1]"]);
		const result = parseDynamicCssVariables(classes);

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("primary");
		expect(result[0].value).toBe("#3b82f6");
	});

	it("should handle empty classes", () => {
		const classes = new Set();
		const result = parseDynamicCssVariables(classes);

		expect(result).toHaveLength(0);
	});
});

describe("generateDynamicCssVariables", () => {
	it("should generate dynamic CSS variables", () => {
		const variables = [
			{ name: "primary", value: "#3b82f6" },
			{ name: "secondary", value: "#6366f1" },
		];
		const result = generateDynamicCssVariables(variables);

		expect(result).toContain("--styling-primary: #3b82f6");
		expect(result).toContain("--styling-secondary: #6366f1");
	});

	it("should handle empty variables", () => {
		const result = generateDynamicCssVariables([]);

		expect(result).toBe("");
	});
});
