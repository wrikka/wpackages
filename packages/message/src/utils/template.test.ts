import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { NotificationError } from "../types";
import { renderTemplate, validateTemplate } from "./template";

describe("template utilities", () => {
	describe("renderTemplate", () => {
		it("should render template with simple variables", async () => {
			const template = "Hello {{name}}, welcome to {{platform}}!";
			const data = { name: "John", platform: "WTS" };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("Hello John, welcome to WTS!");
		});

		it("should handle multiple occurrences of the same variable", async () => {
			const template = "{{name}} {{name}} {{name}}";
			const data = { name: "Test" };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("Test Test Test");
		});

		it("should handle variables with spaces", async () => {
			const template = "Value: {{ key }}";
			const data = { key: "value" };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("Value: value");
		});

		it("should fail with unreplaced variables", async () => {
			const template = "Hello {{name}}, welcome to {{platform}}!";
			const data = { name: "John" }; // missing 'platform'

			const result = await Effect.runPromise(
				Effect.either(renderTemplate(template, data)),
			);

			expect(result._tag).toBe("Left");
			const leftResult = result as { _tag: "Left"; left: NotificationError };
			expect(leftResult.left).toBeInstanceOf(NotificationError);
			expect(leftResult.left.message).toContain("unreplaced variables");
		});

		it("should handle empty template", async () => {
			const template = "";
			const data = { name: "John" };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("");
		});

		it("should handle template without variables", async () => {
			const template = "Hello, world!";
			const data = { name: "John" };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("Hello, world!");
		});

		it("should convert non-string values to strings", async () => {
			const template = "Count: {{count}}, Price: {{price}}";
			const data = { count: 42, price: 99.99 };

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toBe("Count: 42, Price: 99.99");
		});

		it("should handle complex nested data", async () => {
			const template = "User: {{user}}, Items: {{items}}";
			const data = {
				user: { id: 1, name: "John" },
				items: [1, 2, 3],
			};

			const result = await Effect.runPromise(renderTemplate(template, data));

			expect(result).toContain("User: [object Object]");
			expect(result).toContain("Items: 1,2,3");
		});
	});

	describe("validateTemplate", () => {
		it("should validate correct template", async () => {
			const template = "Hello {{name}}!";

			const result = await Effect.runPromise(validateTemplate(template));

			expect(result).toBe(true);
		});

		it("should validate template with multiple variables", async () => {
			const template = "{{a}} {{b}} {{c}}";

			const result = await Effect.runPromise(validateTemplate(template));

			expect(result).toBe(true);
		});

		it("should fail on unmatched opening braces", async () => {
			const template = "Hello {{name}";

			const result = await Effect.runPromise(
				Effect.either(validateTemplate(template)),
			);

			expect(result._tag).toBe("Left");
			const leftResult = result as { _tag: "Left"; left: NotificationError };
			expect(leftResult.left).toBeInstanceOf(NotificationError);
			expect(leftResult.left.message).toContain("unmatched opening braces");
		});

		it("should fail on unmatched closing braces", async () => {
			const template = "Hello name}}";

			const result = await Effect.runPromise(
				Effect.either(validateTemplate(template)),
			);

			expect(result._tag).toBe("Left");
			const leftResult = result as { _tag: "Left"; left: NotificationError };
			expect(leftResult.left).toBeInstanceOf(NotificationError);
			expect(leftResult.left.message).toContain("unmatched closing braces");
		});

		it("should validate empty template", async () => {
			const template = "";

			const result = await Effect.runPromise(validateTemplate(template));

			expect(result).toBe(true);
		});

		it("should validate template without variables", async () => {
			const template = "Plain text without variables";

			const result = await Effect.runPromise(validateTemplate(template));

			expect(result).toBe(true);
		});

		it("should handle nested braces correctly", async () => {
			const template = "{{{{nested}}}}";

			const result = await Effect.runPromise(validateTemplate(template));

			expect(result).toBe(true);
		});
	});
});
