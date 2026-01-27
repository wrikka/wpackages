import { Effect } from "effect";
import { printError } from "../components";
import type { TranslationRequest } from "../types";

export interface ParsedArgs {
	request?: TranslationRequest;
	analyze?: boolean;
	help?: boolean;
}

export const parseArgs = (args: readonly string[]): Effect.Effect<ParsedArgs, never> => {
	return Effect.sync(() => {
		const result: ParsedArgs = {};

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];

			if (arg === "--help" || arg === "-h") {
				result.help = true;
				return result;
			}

      if (arg === "--analyze") {
        result.analyze = true;
        continue;
      }

      if (arg === "--from" && args[i + 1]) {
        if (!result.request) result.request = {} as TranslationRequest;
        (result.request as any).sourceLanguage = args[i + 1] as any;
        i++;
        continue;
      }

      if (arg === "--to" && args[i + 1]) {
        if (!result.request) result.request = {} as TranslationRequest;
        (result.request as any).targetLanguage = args[i + 1] as any;
        i++;
        continue;
      }

      if (arg === "--code" && args[i + 1]) {
        if (!result.request) result.request = {} as TranslationRequest;
        (result.request as any).sourceCode = args[i + 1];
        i++;
        continue;
      }

      if (arg === "--file" && args[i + 1]) {
        if (!result.request) result.request = {} as TranslationRequest;
        try {
          const filePath = args[i + 1];
          if (!filePath) {
            printError("File path is required");
            process.exit(1);
          }
          (result.request as any).sourceCode = Bun.file(filePath).text();
        } catch {
          printError(`Failed to read file: ${args[i + 1]}`);
          process.exit(1);
        }
        i++;
        continue;
      }
    }

    return result;
  });
};

export const printHelp = (): void => {
	console.log("Code Translate CLI - Translate code between programming languages");
	console.log("\nUsage:");
	console.log("  code-translate [options]");
	console.log("\nOptions:");
	console.log("  --from <lang>    Source language");
	console.log("  --to <lang>      Target language");
	console.log("  --code <code>    Code to translate");
	console.log("  --file <path>    Read code from file");
	console.log("  --analyze        Analyze code without translating");
	console.log("  --help           Show this help message");
	console.log("\nExamples:");
	console.log("  code-translate --from javascript --to python --code 'console.log(\"Hello\")'");
	console.log("  code-translate --from typescript --to go --file ./src/index.ts");
	console.log("  code-translate --analyze --file ./src/index.ts");
};
