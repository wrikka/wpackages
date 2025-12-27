/**
 * Rule types for linting
 */

import type { Severity } from "./severity";

export type RuleCategory =
	| "best-practices"
	| "errors"
	| "style"
	| "performance"
	| "security"
	| "typescript"
	| "functional";

export type RuleMeta = {
	readonly name: string;
	readonly description: string;
	readonly category: RuleCategory;
	readonly recommended: boolean;
	readonly fixable: boolean;
	readonly deprecated?: boolean;
	readonly replacedBy?: string[];
};

export type RuleContext = {
	readonly filename: string;
	readonly sourceCode: string;
	readonly ast: unknown;
	readonly options: Record<string, unknown>;
};

export type LintMessage = {
	readonly ruleId: string;
	readonly severity: Severity;
	readonly message: string;
	readonly line: number;
	readonly column: number;
	readonly endLine?: number;
	readonly endColumn?: number;
	readonly fix?: Fix;
	readonly suggestions?: readonly Suggestion[];
};

export type Fix = {
	readonly range: readonly [number, number];
	readonly text: string;
};

export type Suggestion = {
	readonly desc: string;
	readonly fix: Fix;
};

export type Rule = {
	readonly meta: RuleMeta;
	readonly check: (context: RuleContext) => readonly LintMessage[];
};

export type RuleConfig = Severity | "off";
