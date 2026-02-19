export interface CssVariableDefinition {
	readonly name: string;
	readonly value: string;
	readonly fallback?: string;
}

export interface CssVariableOptions {
	readonly prefix?: string;
	readonly variables?: Record<string, CssVariableDefinition | string>;
	readonly themeVariables?: boolean;
}

export type CssVariableValue = string | number | CssVariableDefinition;

export interface DynamicCssVariable {
	readonly name: string;
	readonly value: string;
	readonly fallback?: string;
}
