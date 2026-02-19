/**
 * Generate JSON schema from TypeScript type at build time.
 * Creates a JSON Schema definition for validation and documentation.
 *
 * @param typeDefinition - Type definition object
 * @param options - Schema generation options
 * @returns JSON Schema as string
 * @throws Error if type definition is invalid
 *
 * @example
 * // const schema = generateSchema({
 * //   type: "object",
 * //   properties: {
 * //     apiKey: { type: "string", minLength: 1 },
 * //     port: { type: "number", default: 3000 },
 * //     debug: { type: "boolean", default: false }
 * //   },
 * //   required: ["apiKey"]
 * // })
 */
export const generateSchema = Bun.macro((
	typeDefinition: TypeDefinition,
	options: SchemaOptions = {},
) => {
	try {
		const schema = convertToSchema(typeDefinition, options);
		return JSON.stringify(schema);
	} catch (error) {
		throw new Error(
			"Failed to generate schema: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Type definition for schema generation.
 */
type TypeDefinition =
	| { type: "string"; minLength?: number; maxLength?: number; pattern?: string; enum?: string[]; default?: string }
	| { type: "number"; minimum?: number; maximum?: number; default?: number }
	| { type: "integer"; minimum?: number; maximum?: number; default?: number }
	| { type: "boolean"; default?: boolean }
	| { type: "array"; items: TypeDefinition; minItems?: number; maxItems?: number; default?: unknown[] }
	| {
		type: "object";
		properties: Record<string, TypeDefinition>;
		required?: string[];
		additionalProperties?: boolean;
		default?: Record<string, unknown>;
	}
	| { type: "null" }
	| { anyOf: TypeDefinition[] }
	| { oneOf: TypeDefinition[] }
	| { allOf: TypeDefinition[] }
	| { $ref: string };

/**
 * Schema generation options.
 */
interface SchemaOptions {
	$schema?: string;
	title?: string;
	description?: string;
	id?: string;
}

/**
 * Convert type definition to JSON Schema.
 */
function convertToSchema(typeDef: TypeDefinition, options: SchemaOptions): Record<string, unknown> {
	const schema: Record<string, unknown> = {};

	if (options.$schema) {
		schema["$schema"] = options.$schema;
	}
	if (options.title) {
		schema["title"] = options.title;
	}
	if (options.description) {
		schema["description"] = options.description;
	}
	if (options.id) {
		schema["$id"] = options.id;
	}

	if ("type" in typeDef) {
		schema["type"] = typeDef.type;

		switch (typeDef.type) {
			case "string":
				if (typeDef.minLength !== undefined) schema["minLength"] = typeDef.minLength;
				if (typeDef.maxLength !== undefined) schema["maxLength"] = typeDef.maxLength;
				if (typeDef.pattern) schema["pattern"] = typeDef.pattern;
				if (typeDef.enum) schema["enum"] = typeDef.enum;
				if (typeDef.default !== undefined) schema["default"] = typeDef.default;
				break;

			case "number":
			case "integer":
				if (typeDef.minimum !== undefined) schema["minimum"] = typeDef.minimum;
				if (typeDef.maximum !== undefined) schema["maximum"] = typeDef.maximum;
				if (typeDef.default !== undefined) schema["default"] = typeDef.default;
				break;

			case "boolean":
				if (typeDef.default !== undefined) schema["default"] = typeDef.default;
				break;

			case "array":
				schema["items"] = convertToSchema(typeDef.items, {});
				if (typeDef.minItems !== undefined) schema["minItems"] = typeDef.minItems;
				if (typeDef.maxItems !== undefined) schema["maxItems"] = typeDef.maxItems;
				if (typeDef.default !== undefined) schema["default"] = typeDef.default;
				break;

			case "object":
				schema["properties"] = {};
				for (const [key, prop] of Object.entries(typeDef.properties)) {
					(schema["properties"] as Record<string, unknown>)[key] = convertToSchema(prop, {});
				}
				if (typeDef.required && typeDef.required.length > 0) {
					schema["required"] = typeDef.required;
				}
				if (typeDef.additionalProperties !== undefined) {
					schema["additionalProperties"] = typeDef.additionalProperties;
				}
				if (typeDef.default !== undefined) schema["default"] = typeDef.default;
				break;

			case "null":
				break;
		}
	} else if ("anyOf" in typeDef) {
		schema["anyOf"] = typeDef.anyOf.map((def) => convertToSchema(def, {}));
	} else if ("oneOf" in typeDef) {
		schema["oneOf"] = typeDef.oneOf.map((def) => convertToSchema(def, {}));
	} else if ("allOf" in typeDef) {
		schema["allOf"] = typeDef.allOf.map((def) => convertToSchema(def, {}));
	} else if ("$ref" in typeDef) {
		schema["$ref"] = typeDef.$ref;
	}

	return schema;
}
