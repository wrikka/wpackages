import { Effect, pipe } from "effect";
import { translateCode } from "./services";
import { printSuccess, printError, printCode, printConfidence, printProgress } from "./components";
import { extractImports, removeComments, countLines } from "./utils";
import type { TranslationRequest } from "./types";

export const runTranslation = (request: TranslationRequest): Effect.Effect<void, never> => {
	return pipe(
		translateCode(request),
		Effect.map((result) => {
			printSuccess("Translation completed!");
			printCode(result.translatedCode, result.targetLanguage);
			printConfidence(result.confidence);

			if (result.warnings && result.warnings.length > 0) {
				result.warnings.forEach((warning) => printError(warning));
			}

			printProgress(`Source: ${request.sourceCode.split("\n").length} lines`);
			printProgress(`Target: ${result.translatedCode.split("\n").length} lines`);
		}),
		Effect.catchAll((error) => {
			printError(`Translation failed: ${error.message}`);
			if ("details" in error && error.details) {
				printError(`Details: ${error.details}`);
			}
			return Effect.void;
		}),
	);
};

export const analyzeCode = (code: string): Effect.Effect<void, never> => {
	return Effect.sync(() => {
		printProgress("Analyzing code...");

		const imports = extractImports(code);
		const cleanCode = removeComments(code);
		const lines = countLines(code);

		printSuccess(`Found ${imports.length} imports`);
		printSuccess(`Code has ${lines} lines`);
		printSuccess(`Clean code length: ${cleanCode.length} characters`);
	});
};
