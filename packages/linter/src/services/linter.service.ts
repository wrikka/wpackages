import type { LinterOptions, LintReport, LintResult, Rule } from "../types";
import { Arr } from "../utils";

export const lintFile = async (
	filePath: string,
	rules: readonly Rule[],
	options: LinterOptions,
): Promise<LintResult> => {
	// Simulate reading file
	const source = `// File: ${filePath}`;
	const ast = {};

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
};

export const lintFiles = async (
	filePaths: readonly string[],
	rules: readonly Rule[],
	options: LinterOptions,
): Promise<LintReport> => {
	const results = await Promise.all(
		filePaths.map((path) => lintFile(path, rules, options)),
	);

	const initialReport: Omit<LintReport, "results" | "filesLinted"> = {
		errorCount: 0,
		warningCount: 0,
		fixableErrorCount: 0,
		fixableWarningCount: 0,
	};

	const summary = Arr.reduce(
		results,
		(acc, r) => ({
			errorCount: acc.errorCount + r.errorCount,
			warningCount: acc.warningCount + r.warningCount,
			fixableErrorCount: acc.fixableErrorCount + r.fixableErrorCount,
			fixableWarningCount: acc.fixableWarningCount + r.fixableWarningCount,
		}),
		initialReport,
	);

	return {
		...summary,
		results,
		filesLinted: results.length,
	};
};
