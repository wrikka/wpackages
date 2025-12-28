import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { transform } from "../index";

describe("transform", () => {
	it("should transform JSON to TOML", () => {
		const json = "{\"name\": \"test\", \"version\": \"1.0.0\"}";
		const result = Effect.runSync(transform(json, "json", "toml"));

		expect(result).toContain("name = \"test\"");
		expect(result).toContain("version = \"1.0.0\"");
	});

	it("should transform TOML to JSON", () => {
		const toml = "name = \"test\"\nversion = \"1.0.0\"";
		const result = Effect.runSync(transform(toml, "toml", "json"));

		const parsed = JSON.parse(result);
		expect(parsed.name).toBe("test");
		expect(parsed.version).toBe("1.0.0");
	});

	it("should auto-detect format", () => {
		const json = "{\"key\": \"value\"}";
		const result = Effect.runSync(transform(json, "auto", "toml"));

		expect(result).toContain("key = \"value\"");
	});

	it("should transform JSON array to Markdown table", () => {
		const json = "[{\"name\": \"Alice\", \"age\": 30}, {\"name\": \"Bob\", \"age\": 25}]";
		const result = Effect.runSync(transform(json, "json", "markdown"));

		expect(result).toContain("| name | age |");
		expect(result).toContain("| Alice | 30 |");
		expect(result).toContain("| Bob | 25 |");
	});

	it("should transform TypeScript to Markdown code block", () => {
		const ts = "const x: number = 10;";
		const result = Effect.runSync(transform(ts, "typescript", "markdown"));

		expect(result).toBe("```typescript\nconst x: number = 10;\n```");
	});

	it("should transform TOML to Markdown list", () => {
		const toml = `[package]\nname = "my-app"\nversion = "0.1.0"`;
		const result = Effect.runSync(transform(toml, "toml", "markdown"));

		expect(result).toContain("### package");
		expect(result).toContain("- **name**: my-app");
		expect(result).toContain("- **version**: 0.1.0");
	});
});
