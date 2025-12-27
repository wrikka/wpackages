import { describe, expect, it } from "vitest";
import { Effect } from "effect";
import { transform } from "./app";

describe("transform", () => {
	describe("explicit format specification", () => {
		it("should transform JSON to TOML", () => {
			const json = '{"name": "test", "version": "1.0.0"}';
			const result = Effect.runSync(transform(json, "json", "toml"));

			expect(result).toContain('name = "test"');
			expect(result).toContain('version = "1.0.0"');
		});

		it("should transform TOML to JSON", () => {
			const toml = 'name = "test"\nversion = "1.0.0"';
			const result = Effect.runSync(transform(toml, "toml", "json"));
			const parsed = JSON.parse(result);

			expect(parsed.name).toBe("test");
			expect(parsed.version).toBe("1.0.0");
		});

		it("should transform JSON to Markdown", () => {
			const json = '[{"name": "Alice", "age": 30}]';
			const result = Effect.runSync(transform(json, "json", "markdown"));

			expect(result).toContain("| name | age |");
		});

		it("should transform Markdown to JSON", () => {
			const markdown = "# Title\n\nContent";
			const result = Effect.runSync(transform(markdown, "markdown", "json"));
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("root");
		});

		it("should transform TypeScript to JSON", () => {
			const ts = "const x = 1;";
			const result = Effect.runSync(transform(ts, "typescript", "json"));
			const parsed = JSON.parse(result);

			expect(parsed.type).toBe("Program");
		});

		it("should transform TypeScript to Markdown", () => {
			const ts = "const x: number = 10;";
			const result = Effect.runSync(transform(ts, "typescript", "markdown"));

			expect(result).toBe("```typescript\nconst x: number = 10;\n```");
		});

		it("should transform TOML to Markdown", () => {
			const toml = '[package]\nname = "my-app"';
			const result = Effect.runSync(transform(toml, "toml", "markdown"));

			expect(result).toContain("### package");
		});
	});

	describe("auto-detect format", () => {
		it("should auto-detect JSON and transform to TOML", () => {
			const json = '{"key": "value"}';
			const result = Effect.runSync(transform(json, "auto", "toml"));

			expect(result).toContain('key = "value"');
		});

		it("should auto-detect TOML and transform to JSON", () => {
			const toml = 'key = "value"';
			const result = Effect.runSync(transform(toml, "auto", "json"));
			const parsed = JSON.parse(result);

			expect(parsed.key).toBe("value");
		});

		it("should auto-detect TypeScript and transform to Markdown", () => {
			const ts = "const x = 1;";
			const result = Effect.runSync(transform(ts, "auto", "markdown"));

			expect(result).toContain("```typescript");
		});
	});

	describe("with filename hint", () => {
		it("should use filename for format detection", () => {
			const json = '{"key": "value"}';
			const result = Effect.runSync(transform(json, "auto", "toml", {}, "config.json"));

			expect(result).toContain('key = "value"');
		});

		it("should detect TypeScript from filename", () => {
			const code = "const x = 1;";
			const result = Effect.runSync(transform(code, "auto", "markdown", {}, "script.ts"));

			expect(result).toContain("```typescript");
		});
	});

	describe("with options", () => {
		it("should support pretty print option", () => {
			const toml = 'name = "test"';
			const result = Effect.runSync(transform(toml, "toml", "json", { pretty: true, indent: 2 }));

			expect(result).toContain("\n");
		});

		it("should support compact output", () => {
			const toml = 'name = "test"';
			const result = Effect.runSync(transform(toml, "toml", "json", { pretty: false }));

			expect(result).not.toContain("\n");
		});
	});

	describe("error handling", () => {
		it("should fail on unsupported transformation", () => {
			const json = '{"key": "value"}';

			expect(() => {
				Effect.runSync(transform(json, "json", "unsupported" as any));
			}).toThrow("No transformer found for json -> unsupported");
		});

		it("should fail on invalid source format", () => {
			const json = "{invalid}";

			expect(() => {
				Effect.runSync(transform(json, "json", "toml"));
			}).toThrow("Failed to parse JSON");
		});

		it("should fail on invalid TOML", () => {
			const toml = "[invalid\nkey = value";

			expect(() => {
				Effect.runSync(transform(toml, "toml", "json"));
			}).toThrow("Failed to parse TOML");
		});
	});

	describe("complex transformations", () => {
		it("should transform nested JSON to TOML", () => {
			const json = '{"package": {"name": "my-app", "version": "0.1.0"}}';
			const result = Effect.runSync(transform(json, "json", "toml"));

			expect(result).toContain("[package]");
		});

		it("should transform JSON array to Markdown table", () => {
			const json = '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]';
			const result = Effect.runSync(transform(json, "json", "markdown"));

			expect(result).toContain("| name | age |");
			expect(result).toContain("| Alice | 30 |");
			expect(result).toContain("| Bob | 25 |");
		});

		it("should transform TOML sections to Markdown", () => {
			const toml = '[package]\nname = "my-app"\nversion = "0.1.0"';
			const result = Effect.runSync(transform(toml, "toml", "markdown"));

			expect(result).toContain("### package");
			expect(result).toContain("- **name**: my-app");
		});
	});

	describe("Effect integration", () => {
		it("should return Effect type", () => {
			const json = '{"key": "value"}';
			const effect = transform(json, "json", "toml");

			expect(effect).toBeDefined();
			expect(typeof effect).toBe("object");
		});

		it("should be runnable with Effect.runSync", () => {
			const json = '{"key": "value"}';
			const effect = transform(json, "json", "toml");

			expect(() => Effect.runSync(effect)).not.toThrow();
		});
	});
});
