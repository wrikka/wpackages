import { describe, expect, it } from "vitest";
import { createTemplateHelpers, renderTemplate, validateTemplateVariables } from "./template-renderer.util";

describe("template-renderer utils", () => {
	describe("renderTemplate", () => {
		it("should replace simple variables", () => {
			const template = "Hello {{ name }}!";
			const context = {
				variables: { name: "World" },
				helpers: createTemplateHelpers(),
			};

			expect(renderTemplate(template, context)).toBe("Hello World!");
		});

		it("should apply helper functions", () => {
			const template = "{{ pascal name }}";
			const context = {
				variables: { name: "hello world" },
				helpers: createTemplateHelpers(),
			};

			expect(renderTemplate(template, context)).toBe("HelloWorld");
		});

		it("should handle multiple replacements", () => {
			const template = "{{ camel name }} and {{ kebab name }}";
			const context = {
				variables: { name: "HelloWorld" },
				helpers: createTemplateHelpers(),
			};

			expect(renderTemplate(template, context)).toBe(
				"helloWorld and hello-world",
			);
		});

		it("should keep unreplaced variables as is", () => {
			const template = "{{ existing }} and {{ missing }}";
			const context = {
				variables: { existing: "value" },
				helpers: createTemplateHelpers(),
			};

			expect(renderTemplate(template, context)).toBe("value and {{ missing }}");
		});
	});

	describe("createTemplateHelpers", () => {
		it("should create all helper functions", () => {
			const helpers = createTemplateHelpers();

			expect(helpers.pascal("hello world")).toBe("HelloWorld");
			expect(helpers.camel("hello world")).toBe("helloWorld");
			expect(helpers.kebab("hello world")).toBe("hello-world");
			expect(helpers.snake("hello world")).toBe("hello_world");
			expect(helpers.constant("hello world")).toBe("HELLO_WORLD");
		});

		it("should pluralize words", () => {
			const helpers = createTemplateHelpers();

			expect(helpers.plural("user")).toBe("users");
			expect(helpers.plural("category")).toBe("categories");
			expect(helpers.plural("class")).toBe("classes");
		});

		it("should singularize words", () => {
			const helpers = createTemplateHelpers();

			expect(helpers.singular("users")).toBe("user");
			expect(helpers.singular("categories")).toBe("category");
			expect(helpers.singular("classes")).toBe("class");
		});
	});

	describe("validateTemplateVariables", () => {
		it("should return empty array when all variables provided", () => {
			const variables = { name: "test", type: "component" };
			const required = ["name", "type"];

			expect(validateTemplateVariables(variables, required)).toEqual([]);
		});

		it("should return missing variable names", () => {
			const variables = { name: "test" };
			const required = ["name", "type", "description"];

			expect(validateTemplateVariables(variables, required)).toEqual([
				"type",
				"description",
			]);
		});
	});
});
