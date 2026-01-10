export interface SchemaProperty {
	readonly type: "string" | "number" | "boolean" | "object" | "array" | "enum";
	readonly description?: string;
	readonly default?: unknown;
	readonly required?: boolean;
	readonly enum?: readonly string[];
	readonly min?: number;
	readonly max?: number;
	readonly pattern?: string;
	readonly properties?: Record<string, SchemaProperty>;
	readonly items?: SchemaProperty;
}

export interface ConfigSchema {
	readonly $schema?: string;
	readonly version: string;
	readonly title: string;
	readonly description?: string;
	readonly properties: Record<string, SchemaProperty>;
	readonly required?: readonly string[];
}

export interface ConfigValidationError {
	readonly path: string;
	readonly message: string;
	readonly value?: unknown;
}

export interface ConfigValidationResult {
	readonly valid: boolean;
	readonly errors?: readonly ConfigValidationError[];
}

export interface ConfigMigration {
	readonly fromVersion: string;
	readonly toVersion: string;
	readonly migrate: (config: Record<string, unknown>) => Record<string, unknown>;
}

export interface ConfigSchemaManager {
	readonly validate: (
		schema: ConfigSchema,
		config: Record<string, unknown>,
	) => ConfigValidationResult;
	readonly applyDefaults: (
		schema: ConfigSchema,
		config: Record<string, unknown>,
	) => Record<string, unknown>;
	readonly addMigration: (migration: ConfigMigration) => void;
	readonly migrate: (
		config: Record<string, unknown>,
		fromVersion: string,
		toVersion: string,
	) => Record<string, unknown>;
	readonly getSchema: () => ConfigSchema;
}
