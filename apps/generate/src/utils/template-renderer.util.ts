import { TEMPLATE_HELPER_PATTERN, TEMPLATE_VARIABLE_PATTERN } from "../constant";
import type { TemplateContext, TemplateHelpers } from "../types";
import { toCamelCase, toConstantCase, toKebabCase, toPascalCase, toSnakeCase } from "./case-converter.util";

/**
 * Render template with variables and helpers
 */
export const renderTemplate = (
	template: string,
	context: TemplateContext,
): string => {
	let rendered = template;

	// First pass: replace helper functions
	rendered = rendered.replace(
		TEMPLATE_HELPER_PATTERN,
		(_, helperName: string, varName: string) => {
			const helper = context.helpers[helperName as keyof TemplateHelpers];
			const value = context.variables[varName];

			if (!helper || value === undefined) return _;
			// Helpers should only operate on strings
			if (typeof value !== "string") {
				return _;
			}
			return helper(value);
		},
	);

	// Second pass: replace simple variables
	rendered = rendered.replace(TEMPLATE_VARIABLE_PATTERN, (_, varName) => {
		const value = context.variables[varName];
		if (value === undefined || value === null) return _;

		// Only render primitive values to avoid [object Object]
		if (
			typeof value === "string"
			|| typeof value === "number"
			|| typeof value === "boolean"
		) {
			return String(value);
		}

		return _;
	});

	return rendered;
};

/**
 * Create default template helpers
 */
export const createTemplateHelpers = (): TemplateHelpers => ({
	pascal: toPascalCase,
	camel: toCamelCase,
	kebab: toKebabCase,
	snake: toSnakeCase,
	constant: toConstantCase,
	plural: (str: string) => {
		// Simple pluralization
		if (str.endsWith("y")) return `${str.slice(0, -1)}ies`;
		if (str.endsWith("s")) return `${str}es`;
		return `${str}s`;
	},
	singular: (str: string) => {
		// Simple singularization
		if (str.endsWith("ies")) return `${str.slice(0, -3)}y`;
		if (str.endsWith("ses")) return str.slice(0, -2);
		if (str.endsWith("s")) return str.slice(0, -1);
		return str;
	},
});

/**
 * Validate required variables in template
 */
export const validateTemplateVariables = (
	variables: Record<string, unknown>,
	required: readonly string[],
): string[] => {
	const missing: string[] = [];

	for (const varName of required) {
		if (!(varName in variables)) {
			missing.push(varName);
		}
	}

	return missing;
};
