import { Effect } from "effect";
import type { TranslationRequest, TranslationResult, TranslationError } from "./translation";

export interface TranslationProvider {
	readonly name: string;
	readonly translate: (request: TranslationRequest) => Effect.Effect<TranslationResult, TranslationError>;
}

export class MockTranslationProvider implements TranslationProvider {
	readonly name = "Mock";

	translate(request: TranslationRequest): Effect.Effect<TranslationResult, TranslationError> {
		return Effect.gen(function* () {
			yield* Effect.logInfo(`Translating from ${request.sourceLanguage} to ${request.targetLanguage} using ${this.name}`);

			const translatedCode = yield* this.performTranslation(request);

			const result: TranslationResult = {
				translatedCode,
				sourceLanguage: request.sourceLanguage,
				targetLanguage: request.targetLanguage,
				confidence: this.calculateConfidence(request, translatedCode),
				warnings: [],
			};

			yield* Effect.logInfo("Translation completed successfully");
			return result;
		}).pipe(Effect.provideService(this));
	}

	private performTranslation(request: TranslationRequest): Effect.Effect<string, TranslationError> {
		return Effect.tryPromise({
			try: async () => {
				await new Promise((resolve) => setTimeout(resolve, 100));
				return this.mockTranslate(request.sourceCode, request.sourceLanguage, request.targetLanguage);
			},
			catch: () => ({
				_tag: "TranslationFailed",
				message: "Failed to translate code",
				details: "Mock translation error",
			} as const),
		});
	}

	private mockTranslate(code: string, from: string, to: string): string {
		const comments = code.match(/\/\/.*$/gm)?.join("\n") ?? "";
		const cleanCode = code.replace(/\/\/.*$/gm, "");

		const translated = cleanCode
			.replace(/const\s+(\w+)\s*=/g, (match, name) => {
				if (to === "python") return `${name} =`;
				if (to === "java") return `final var ${name} =`;
				return match;
			})
			.replace(/function\s+(\w+)/g, (match, name) => {
				if (to === "python") return `def ${name}`;
				if (to === "java") return `public static void ${name}`;
				if (to === "go") return `func ${name}`;
				return match;
			})
			.replace(/console\.log/g, () => {
				if (to === "python") return "print";
				if (to === "java") return "System.out.println";
				if (to === "go") return "fmt.Println";
				return "console.log";
			});

		return `${comments}\n${translated}`;
	}

	private calculateConfidence(request: TranslationRequest, translatedCode: string): number {
		const sourceLength = request.sourceCode.length;
		const translatedLength = translatedCode.length;
		const lengthRatio = Math.min(sourceLength, translatedLength) / Math.max(sourceLength, translatedLength);

		return Math.min(1, lengthRatio + 0.2);
	}
}
