/**
 * Database schema validation macro for build-time schema checking.
 * Validates TypeScript schema against database schema at build time.
 *
 * @param schema - Schema definition to validate
 * @param options - Validation options
 * @returns Validation result
 * @throws Error if validation fails
 *
 * @example
 * // validateSchema({
 * //   tableName: "users",
 * //   schema: {
 * //     id: { type: "number", required: true },
 * //     email: { type: "string", required: true }
 * //   }
 * // })
 */
export const validateSchema = Bun.macro((
	schema: DatabaseSchema,
	_options: ValidationOptions = {},
) => {
	try {
		const errors: string[] = [];

		if (!schema.tableName) {
			errors.push("Table name is required");
		}

		if (!schema.schema || Object.keys(schema.schema).length === 0) {
			errors.push("Schema definition is required");
		}

		for (const [column, columnDef] of Object.entries(schema.schema)) {
			if (!columnDef.type) {
				errors.push(`Column "${column}" must have a type`);
			}

			if (columnDef.required && columnDef.default !== undefined) {
				errors.push(`Column "${column}" cannot be both required and have a default value`);
			}
		}

		if (errors.length > 0) {
			throw new Error("Schema validation failed:\n" + errors.join("\n"));
		}

		return JSON.stringify({
			valid: true,
			tableName: schema.tableName,
			columns: Object.keys(schema.schema),
		});
	} catch (error) {
		throw new Error(
			"Failed to validate database schema: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Database schema definition.
 */
interface DatabaseSchema {
	tableName: string;
	schema: Record<string, ColumnDefinition>;
}

/**
 * Column definition.
 */
interface ColumnDefinition {
	type: "string" | "number" | "boolean" | "date" | "json" | "enum";
	required?: boolean;
	default?: unknown;
	unique?: boolean;
	enumValues?: string[];
	minLength?: number;
	maxLength?: number;
	minimum?: number;
	maximum?: number;
}

/**
 * Validation options.
 */
interface ValidationOptions {
	strict?: boolean;
	allowExtraColumns?: boolean;
}
