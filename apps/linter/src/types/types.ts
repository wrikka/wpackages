/**
 * Core type definitions for lint
 */

// ============================================================================
// Severity Levels
// ============================================================================

export type Severity = "error" | "warning" | "info" | "hint";

// ============================================================================
// Lint Rule Types
// ============================================================================

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
};

export type Fix = {
	readonly range: readonly [number, number];
	readonly text: string;
};

export type Rule = {
	readonly meta: RuleMeta;
	readonly check: (context: RuleContext) => readonly LintMessage[];
};

// ============================================================================
// Linter Types
// ============================================================================

export type LinterOptions = {
	readonly rules: Record<string, Severity | "off">;
	readonly fix: boolean;
	readonly ignore: readonly string[];
	readonly extensions: readonly string[];
};

export type LintResult = {
	readonly filePath: string;
	readonly messages: readonly LintMessage[];
	readonly errorCount: number;
	readonly warningCount: number;
	readonly fixableErrorCount: number;
	readonly fixableWarningCount: number;
	readonly source?: string;
};

export type LintReport = {
	readonly results: readonly LintResult[];
	readonly errorCount: number;
	readonly warningCount: number;
	readonly fixableErrorCount: number;
	readonly fixableWarningCount: number;
	readonly filesLinted: number;
};

// ============================================================================
// Parser Types - Re-exported from parser
// ============================================================================

// Parser types are defined in rule.ts

// ============================================================================
// Configuration Types
// ============================================================================

export type Config = {
	readonly extends?: string | readonly string[];
	readonly rules?: Record<string, Severity | "off">;
	readonly ignore?: readonly string[];
	readonly fix?: boolean;
};
