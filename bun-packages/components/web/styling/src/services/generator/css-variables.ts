import type { CssVariableOptions, DynamicCssVariable } from "../../types/css-variables";

const DEFAULT_PREFIX = "--styling";

export function generateCssVariables(options: CssVariableOptions = {}): string {
	const { prefix = DEFAULT_PREFIX, variables = {}, themeVariables = false } = options;
	const cssParts: string[] = [];

	const rootVars: string[] = [];

	for (const [key, value] of Object.entries(variables)) {
		const varName = `${prefix}-${key}`;
		let varValue: string;
		let fallback: string | undefined;

		if (typeof value === "string") {
			varValue = value;
		} else {
			varValue = value.value;
			fallback = value.fallback;
		}

		if (fallback) {
			rootVars.push(`${varName}: ${varValue};\n  ${varName}-fallback: ${fallback};`);
		} else {
			rootVars.push(`${varName}: ${varValue};`);
		}
	}

	if (rootVars.length > 0) {
		cssParts.push(`:root {\n  ${rootVars.join("\n  ")}\n}`);
	}

	if (themeVariables) {
		cssParts.push(generateThemeVariables(prefix));
	}

	return cssParts.join("\n\n");
}

function generateThemeVariables(prefix: string): string {
	const themeVars = [
		`${prefix}-color-primary: #3b82f6;`,
		`${prefix}-color-secondary: #6366f1;`,
		`${prefix}-color-success: #10b981;`,
		`${prefix}-color-warning: #f59e0b;`,
		`${prefix}-color-danger: #ef4444;`,
		`${prefix}-color-info: #06b6d4;`,
		`${prefix}-spacing-xs: 0.25rem;`,
		`${prefix}-spacing-sm: 0.5rem;`,
		`${prefix}-spacing-md: 1rem;`,
		`${prefix}-spacing-lg: 1.5rem;`,
		`${prefix}-spacing-xl: 2rem;`,
		`${prefix}-spacing-2xl: 3rem;`,
		`${prefix}-font-size-xs: 0.75rem;`,
		`${prefix}-font-size-sm: 0.875rem;`,
		`${prefix}-font-size-base: 1rem;`,
		`${prefix}-font-size-lg: 1.125rem;`,
		`${prefix}-font-size-xl: 1.25rem;`,
		`${prefix}-font-size-2xl: 1.5rem;`,
		`${prefix}-font-size-3xl: 1.875rem;`,
		`${prefix}-font-size-4xl: 2.25rem;`,
		`${prefix}-border-radius-sm: 0.125rem;`,
		`${prefix}-border-radius-md: 0.375rem;`,
		`${prefix}-border-radius-lg: 0.5rem;`,
		`${prefix}-border-radius-xl: 0.75rem;`,
		`${prefix}-border-radius-full: 9999px;`,
		`${prefix}-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);`,
		`${prefix}-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);`,
		`${prefix}-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);`,
		`${prefix}-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);`,
	];

	return `:root {\n  ${themeVars.join("\n  ")}\n}`;
}

export function parseDynamicCssVariables(classes: ReadonlySet<string>): DynamicCssVariable[] {
	const variables: DynamicCssVariable[] = [];
	const varRegex = /\[var-([a-z0-9-]+)(?:=([^]]+))?\]/gi;

	for (const cls of classes) {
		const matches = cls.matchAll(varRegex);
		for (const match of matches) {
			const name = match[1];
			const value = match[2];
			variables.push({
				name,
				value: value || "",
			});
		}
	}

	return variables;
}

export function generateDynamicCssVariables(variables: DynamicCssVariable[], prefix: string = DEFAULT_PREFIX): string {
	if (variables.length === 0) return "";

	const cssParts: string[] = [];

	for (const variable of variables) {
		const varName = `${prefix}-${variable.name}`;
		cssParts.push(`${varName}: ${variable.value};`);
	}

	return `:root {\n  ${cssParts.join("\n  ")}\n}`;
}

export function resolveCssVariable(name: string, fallback?: string, prefix: string = DEFAULT_PREFIX): string {
	const varName = `${prefix}-${name}`;
	return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}
