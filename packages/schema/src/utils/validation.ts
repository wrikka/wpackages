/**
 * Validation utilities
 */

import type {
	Issue,
	ValidationContext as BaseValidationContext,
} from "../types";

export type ValidationContext = BaseValidationContext & {
	readonly issues: Issue[];
	data?: unknown;
};

export const addIssue = (
	ctx: ValidationContext,
	issue: Omit<Issue, "path">,
): void => {
	ctx.issues.push({
		...issue,
		path: ctx.path,
	});
};

export const createValidationContext = (): ValidationContext => ({
	issues: [],
	path: [],
});
