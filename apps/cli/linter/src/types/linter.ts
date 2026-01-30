/**
 * Linter configuration and result types
 */

import type { LintMessage, RuleConfig } from "./rule";

export type LinterOptions = {
	readonly rules: Record<string, RuleConfig>;
	readonly fix: boolean;
	readonly ignore: readonly string[];
	readonly extensions: readonly string[];
	readonly maxWarnings?: number;
	readonly cache?: boolean;
	readonly cacheLocation?: string;
};

export type LintResult = {
	readonly filePath: string;
	readonly messages: readonly LintMessage[];
	readonly errorCount: number;
	readonly warningCount: number;
	readonly fixableErrorCount: number;
	readonly fixableWarningCount: number;
	readonly source?: string;
	readonly output?: string;
};

export type LintReport = {
	readonly results: readonly LintResult[];
	readonly errorCount: number;
	readonly warningCount: number;
	readonly fixableErrorCount: number;
	readonly fixableWarningCount: number;
	readonly filesLinted: number;
	readonly usedDeprecatedRules?: readonly string[];
};
