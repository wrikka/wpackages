/**
 * Validation Component - Pure functions for data validation
 *
 * Functional components that validate inputs without side effects
 */

import type { LintMessage, Rule } from "../types";

/**
 * Check if a rule is valid
 */
export const isValidRule = (rule: Rule): boolean => {
	return (
		typeof rule.meta === "object" &&
		typeof rule.meta.name === "string" &&
		rule.meta.name.trim() !== "" &&
		typeof rule.meta.category === "string" &&
		typeof rule.check === "function"
	);
};

/**
 * Filter valid rules
 */
export const filterValidRules = (rules: Rule[]): Rule[] => {
	return rules.filter(isValidRule);
};

/**
 * Validate file path
 */
export const isValidFilePath = (path: string): boolean => {
	return (
		typeof path === "string" &&
		path.trim() !== "" &&
		!path.includes("..") &&
		!path.startsWith("/")
	);
};

/**
 * Check if message should be reported based on severity
 */
export const shouldReportMessage = (
	message: LintMessage,
	minSeverity: "error" | "warning" = "error",
): boolean => {
	if (minSeverity === "error") {
		return message.severity === "error";
	}
	return true; // Report both errors and warnings
};
