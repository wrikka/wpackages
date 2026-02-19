export type SchemaFormat = "json" | "typescript";

export type SchemaDefinition = {
	[key: string]: SchemaField;
};

export type SchemaField = {
	type?: "string" | "number" | "boolean" | "url" | "email" | "json" | "array";
	required?: boolean;
	default?: string | number | boolean;
	pattern?: RegExp;
	choices?: readonly string[];
	validate?: (value: string) => boolean | string;
	description?: string;
	env?: string;
};

export type SchemaLoadError = {
	_tag: "SchemaLoadError";
	message: string;
	cause?: unknown;
};

export type ValidationResult = {
	valid: boolean;
	errors: ValidationError[];
};

export type ValidationError = {
	key: string;
	message: string;
	type: "missing" | "type" | "pattern" | "choices" | "invalid";
};
