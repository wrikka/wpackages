import { Effect } from "effect";
import { createMessage } from "../components";
import { runSemanticLinter } from "../semantic/semantic.service";
import type { FileSystemError, LinterOptions, LintReport, LintResult, Rule, SemanticLinterError } from "../types";
import { Arr } from "../utils";
import { FileSystemService } from "./file-system.service";
import { parseSource } from "./parser.service";

export const lintFile = (
	filePath: string,
	rules: readonly Rule[],
	options: LinterOptions,
): Effect.Effect<LintResult, FileSystemError> =>
	Effect.gen(function*(_) {
		const source = yield* _(FileSystemService.readFile(filePath));
		const ast = parseSource(source);

		const allMessages = Arr.flatMap(rules, (rule) => {
			const ruleOption = options.rules[rule.meta.name];
			if (ruleOption === "off") return [];

			const context = {
				filename: filePath,
				sourceCode: source,
				ast,
				options: {},
			};
			return rule.check(context);
		});

		const [errors, warnings] = Arr.partition(
			allMessages,
			(msg) => msg.severity === "error",
		);

		return {
			filePath,
			messages: allMessages,
			errorCount: errors.length,
			warningCount: warnings.length,
			fixableErrorCount: Arr.filter(errors, (m) => !!m.fix).length,
			fixableWarningCount: Arr.filter(warnings, (m) => !!m.fix).length,
			source,
		};
	});

export const lintFiles = (
	filePaths: readonly string[],
	rules: readonly Rule[],
	options: LinterOptions,
): Effect.Effect<LintReport, FileSystemError | SemanticLinterError> =>
	Effect.gen(function*(_) {
		// 1. Run syntactic linter
		const syntacticResults = yield* _(Effect.all(
			filePaths.map((path) => lintFile(path, rules, options)),
			{ concurrency: "inherit" },
		));

		// 2. Run semantic linter
		const semanticErrors = yield* _(runSemanticLinter("."));

		// 3. Merge results
		const finalResultsMap = new Map<string, LintResult>();

		// Add syntactic results to map
		syntacticResults.forEach(res => finalResultsMap.set(res.filePath, res));

		// Add semantic results to map
		for (const error of semanticErrors) {
			const message = createMessage(
				"semantic-error", // ruleName
				error.message,
				"error", // severity
				error.line,
				error.character,
			);

			const existingResult = finalResultsMap.get(error.fileName);

			if (existingResult) {
				const updatedMessages = [...existingResult.messages, message];
				finalResultsMap.set(error.fileName, {
					...existingResult,
					messages: updatedMessages,
					errorCount: existingResult.errorCount + 1,
				});
			} else {
				// Create a new result if none exists for this file
				finalResultsMap.set(error.fileName, {
					filePath: error.fileName,
					messages: [message],
					errorCount: 1,
					warningCount: 0,
					fixableErrorCount: 0,
					fixableWarningCount: 0,
				});
			}
		}

		const finalResults = Array.from(finalResultsMap.values());

		const summary = Arr.reduce(
			finalResults,
			(acc, r) => ({
				errorCount: acc.errorCount + r.errorCount,
				warningCount: acc.warningCount + r.warningCount,
				fixableErrorCount: acc.fixableErrorCount + r.fixableErrorCount,
				fixableWarningCount: acc.fixableWarningCount + r.fixableWarningCount,
			}),
			{ errorCount: 0, warningCount: 0, fixableErrorCount: 0, fixableWarningCount: 0 },
		);

		return {
			...summary,
			results: finalResults,
			filesLinted: finalResults.length,
		};
	});
