import type { TemplateContext } from "../types";
import { createTemplateHelpers } from "../utils";

/**
 * Template validation result
 */
export interface TemplateValidationResult {
	valid: boolean;
	missingVariables: string[];
	invalidHelpers: string[];
	errors: string[];
}

/**
 * Extract variables from template
 */
const extractVariables = (template: string): string[] => {
	const regex = /\{\{\s*(\w+)\s+(\w+)\s*\}\}/g;
	const variables = new Set<string>();
	let match: RegExpExecArray | null;

	while ((match = regex.exec(template)) !== null) {
		if (match[2]) {
			variables.add(match[2]);
		}
	}

	return Array.from(variables);
};

/**
 * Extract helpers from template
 */
const extractHelpers = (template: string): string[] => {
	const regex = /\{\{\s*(\w+)\s+/g;
	const helpers = new Set<string>();
	let match: RegExpExecArray | null;

	while ((match = regex.exec(template)) !== null) {
		const helper = match[1];
		if (helper && helper !== "name") {
			helpers.add(helper);
		}
	}

	return Array.from(helpers);
};

/**
 * Validate template against context
 */
export const validateTemplate = (
	template: string,
	context: TemplateContext,
): TemplateValidationResult => {
	const errors: string[] = [];
	const missingVariables: string[] = [];
	const invalidHelpers: string[] = [];

	try {
		// Extract variables and helpers from template
		const templateVariables = extractVariables(template);
		const templateHelpers = extractHelpers(template);

		// Check for missing variables
		for (const variable of templateVariables) {
			if (!(variable in context.variables)) {
				missingVariables.push(variable);
			}
		}

		// Check for invalid helpers
		const availableHelpers = Object.keys(context.helpers);
		for (const helper of templateHelpers) {
			if (!availableHelpers.includes(helper)) {
				invalidHelpers.push(helper);
			}
		}

		return {
			valid: missingVariables.length === 0 && invalidHelpers.length === 0,
			missingVariables,
			invalidHelpers,
			errors,
		};
	} catch (error) {
		errors.push(error instanceof Error ? error.message : "Unknown error");
		return {
			valid: false,
			missingVariables,
			invalidHelpers,
			errors,
		};
	}
};

/**
 * Validate template with default helpers
 */
export const validateTemplateWithDefaults = (
	template: string,
	variables: Record<string, unknown>,
): TemplateValidationResult => {
	const context: TemplateContext = {
		variables,
		helpers: createTemplateHelpers(),
	};

	return validateTemplate(template, context);
};

/**
 * Assert template is valid
 */
export const assertTemplateValid = (
	template: string,
	context: TemplateContext,
): void => {
	const result = validateTemplate(template, context);

	if (!result.valid) {
		const messages: string[] = [];

		if (result.missingVariables.length > 0) {
			messages.push(`Missing variables: ${result.missingVariables.join(", ")}`);
		}

		if (result.invalidHelpers.length > 0) {
			messages.push(`Invalid helpers: ${result.invalidHelpers.join(", ")}`);
		}

		if (result.errors.length > 0) {
			messages.push(`Errors: ${result.errors.join(", ")}`);
		}

		throw new Error(`Template validation failed:\n${messages.join("\n")}`);
	}
};
