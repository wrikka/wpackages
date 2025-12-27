/**
 * Validation utilities
 */

export interface Issue {
	code: string;
	expected?: string;
	received?: any;
	message?: string;
	path?: string[];
	minimum?: number;
	maximum?: number;
	validation?: string;
	pattern?: RegExp;
}

export interface ValidationContext {
	issues: Issue[];
	path: string[];
}

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
