import { describe, expect, test } from "vitest";
import { Effect } from "effect";
import { translateCode } from "./translation.service";
import { MockTranslationProvider } from "../types";

describe("translation.service", () => {
	describe("translateCode", () => {
		test("should translate code from JavaScript to Python", async () => {
			const request = {
				sourceCode: "const x = 1;",
				sourceLanguage: "javascript" as const,
				targetLanguage: "python" as const,
			};

			const result = await Effect.runPromise(translateCode(request));

			expect(result.translatedCode).toContain("x =");
			expect(result.sourceLanguage).toBe("javascript");
			expect(result.targetLanguage).toBe("python");
			expect(result.confidence).toBeGreaterThan(0);
			expect(result.warnings).toEqual([]);
		});

		test("should translate code from JavaScript to Java", async () => {
			const request = {
				sourceCode: "const x = 1;",
				sourceLanguage: "javascript" as const,
				targetLanguage: "java" as const,
			};

			const result = await Effect.runPromise(translateCode(request));

			expect(result.translatedCode).toContain("final var");
			expect(result.targetLanguage).toBe("java");
		});

		test("should handle function translation", async () => {
			const request = {
				sourceCode: "function test() {}",
				sourceLanguage: "javascript" as const,
				targetLanguage: "python" as const,
			};

			const result = await Effect.runPromise(translateCode(request));

			expect(result.translatedCode).toContain("def test");
		});

		test("should handle console.log translation", async () => {
			const request = {
				sourceCode: "console.log('Hello')",
				sourceLanguage: "javascript" as const,
				targetLanguage: "python" as const,
			};

			const result = await Effect.runPromise(translateCode(request));

			expect(result.translatedCode).toContain("print");
		});
	});
});

describe("MockTranslationProvider", () => {
	test("should have correct name", () => {
		const provider = new MockTranslationProvider();
		expect(provider.name).toBe("Mock");
	});

	test("should translate code successfully", async () => {
		const provider = new MockTranslationProvider();
		const request = {
			sourceCode: "const x = 1;",
			sourceLanguage: "javascript" as const,
			targetLanguage: "python" as const,
		};

		const result = await Effect.runPromise(provider.translate(request));

		expect(result.translatedCode).toBeDefined();
		expect(result.confidence).toBeGreaterThan(0);
	});
});
