/**
 * Core type definitions for lint
 *
 * Organized by domain following functional programming principles
 */

// Severity
export type { Severity } from "./severity";
export { compareSeverity, isSeverity, SEVERITY_LEVELS } from "./severity";

// Rules
export type { Fix, LintMessage, Rule, RuleCategory, RuleConfig, RuleContext, RuleMeta, Suggestion } from "./rule";

// Linter
export type { LinterOptions, LintReport, LintResult } from "./linter";

// Config
export type { Config } from "./config";

// Error
export { FileSystemError, SemanticLinterError } from "./error";

// Parser types are defined locally in rule.ts
