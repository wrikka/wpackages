import { describe, expect, it } from "vitest";
import { extractAttributes } from "./attribute-extractor.service";

describe("extractAttributes", () => {
	it("should extract attributes from HTML", () => {
		const code = `<div flex text-center></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("flex");
		expect(result).toContain("text-center");
	});

	it("should extract attributes with values", () => {
		const code = `<div p="4" m="2"></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("p-4");
		expect(result).toContain("m-2");
	});

	it("should extract attributes with quoted values", () => {
		const code = `<div p="4" m="2"></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("p-4");
		expect(result).toContain("m-2");
	});

	it("should extract attributes with object values", () => {
		const code = `<div p={4} m={2}></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("p-4");
		expect(result).toContain("m-2");
	});

	it("should extract shorthand attributes", () => {
		const code = `<div flex></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("flex");
	});

	it("should not extract non-style attributes", () => {
		const code = `<div id="test" data-value="123"></div>`;
		const result = extractAttributes(code);
		expect(result.size).toBe(0);
	});

	it("should extract attributes from Vue template", () => {
		const code = `<template><div flex text-center></div></template>`;
		const result = extractAttributes(code);
		expect(result).toContain("flex");
		expect(result).toContain("text-center");
	});

	it("should extract attributes from JSX", () => {
		const code = `<div flex text-center />`;
		const result = extractAttributes(code);
		expect(result).toContain("flex");
		expect(result).toContain("text-center");
	});

	it("should extract arbitrary value attributes", () => {
		const code = `<div [w]="100px"></div>`;
		const result = extractAttributes(code);
		expect(result).toContain("[w]");
	});
});
