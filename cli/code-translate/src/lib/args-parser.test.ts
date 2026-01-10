import { describe, expect, test } from "vitest";
import { Effect } from "effect";
import { parseArgs, printHelp } from "./args-parser";

describe("args-parser", () => {
	describe("parseArgs", () => {
		test("should parse --help flag", async () => {
			const result = await Effect.runPromise(parseArgs(["--help"]));
			expect(result.help).toBe(true);
		});

		test("should parse -h flag", async () => {
			const result = await Effect.runPromise(parseArgs(["-h"]));
			expect(result.help).toBe(true);
		});

		test("should parse --analyze flag", async () => {
			const result = await Effect.runPromise(parseArgs(["--analyze"]));
			expect(result.analyze).toBe(true);
		});

		test("should parse --from and --to flags", async () => {
			const result = await Effect.runPromise(parseArgs(["--from", "javascript", "--to", "python"]));
			expect(result.request?.sourceLanguage).toBe("javascript");
			expect(result.request?.targetLanguage).toBe("python");
		});

		test("should parse --code flag", async () => {
			const code = "const x = 1;";
			const result = await Effect.runPromise(parseArgs(["--code", code]));
			expect(result.request?.sourceCode).toBe(code);
		});

		test("should parse all required flags", async () => {
			const result = await Effect.runPromise(
				parseArgs(["--from", "javascript", "--to", "python", "--code", "const x = 1;"]),
			);
			expect(result.request?.sourceLanguage).toBe("javascript");
			expect(result.request?.targetLanguage).toBe("python");
			expect(result.request?.sourceCode).toBe("const x = 1;");
		});

		test("should handle multiple flags", async () => {
			const result = await Effect.runPromise(
				parseArgs(["--from", "javascript", "--to", "python", "--code", "const x = 1;", "--analyze"]),
			);
			expect(result.request?.sourceLanguage).toBe("javascript");
			expect(result.request?.targetLanguage).toBe("python");
			expect(result.request?.sourceCode).toBe("const x = 1;");
			expect(result.analyze).toBe(true);
		});

		test("should return empty object for no args", async () => {
			const result = await Effect.runPromise(parseArgs([]));
			expect(result).toEqual({});
		});
	});

	describe("printHelp", () => {
		test("should print help without errors", () => {
			expect(() => printHelp()).not.toThrow();
		});
	});
});
