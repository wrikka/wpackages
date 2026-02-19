import { describe, expect, it } from "vitest";
import { extractClasses } from "./class-extractor.service";

describe("extractClasses", () => {
	it("should extract classes from HTML", () => {
		const code = `<div class="p-4 bg-blue-500"></div>`;
		const result = extractClasses(code);
		expect(result).toContain("p-4");
		expect(result).toContain("bg-blue-500");
	});

	it("should extract classes from JSX", () => {
		const code = `<div className="text-center font-bold"></div>`;
		const result = extractClasses(code);
		expect(result).toContain("text-center");
		expect(result).toContain("font-bold");
	});

	it("should extract classes from Vue template", () => {
		const code = `<template><div class="flex items-center"></div></template>`;
		const result = extractClasses(code);
		expect(result).toContain("flex");
		expect(result).toContain("items-center");
	});

	it("should handle multiple class attributes", () => {
		const code = `<div class="p-4" className="m-2"></div>`;
		const result = extractClasses(code);
		expect(result).toContain("p-4");
		expect(result).toContain("m-2");
	});

	it("should handle dynamic classes", () => {
		const code = `<div class={\`p-4 \${isActive ? 'bg-blue-500' : 'bg-gray-500'}\`}></div>`;
		const result = extractClasses(code);
		expect(result).toContain("p-4");
	});

	it("should handle empty classes", () => {
		const code = `<div></div>`;
		const result = extractClasses(code);
		expect(result.size).toBe(0);
	});

	it("should handle class with template literals", () => {
		const code = `<div class={\`p-4 \${variant}\`}></div>`;
		const result = extractClasses(code);
		expect(result).toContain("p-4");
	});
});
