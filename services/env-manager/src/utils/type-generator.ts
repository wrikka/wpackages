export type TypeDefinition = {
	type: "string" | "number" | "boolean" | "url" | "email" | "json";
	required?: boolean;
	nullable?: boolean;
	enum?: string[];
	description?: string;
};

export type Schema = Record<string, TypeDefinition>;

export const generateTypeScriptInterface = (
	schema: Schema,
	interfaceName = "Env",
): string => {
	const lines: string[] = [];

	lines.push(`export interface ${interfaceName} {`);

	for (const [key, def] of Object.entries(schema)) {
		let typeStr = "";

		switch (def.type) {
			case "string":
				typeStr = "string";
				break;
			case "number":
				typeStr = "number";
				break;
			case "boolean":
				typeStr = "boolean";
				break;
			case "url":
				typeStr = "string";
				break;
			case "email":
				typeStr = "string";
				break;
			case "json":
				typeStr = "unknown";
				break;
		}

		if (def.enum && def.enum.length > 0) {
			typeStr = def.enum.map((v) => `"${v}"`).join(" | ");
		}

		if (def.nullable) {
			typeStr += " | null";
		}

		if (!def.required) {
			typeStr += " | undefined";
		}

		const comment = def.description ? `  /** ${def.description} */\n` : "";
		lines.push(`${comment}  ${key}: ${typeStr};`);
	}

	lines.push("}");

	return lines.join("\n");
};

export const generateTypeScriptType = (
	schema: Schema,
	typeName = "Env",
): string => {
	const lines: string[] = [];

	lines.push(`export type ${typeName} = {`);

	for (const [key, def] of Object.entries(schema)) {
		let typeStr = "";

		switch (def.type) {
			case "string":
				typeStr = "string";
				break;
			case "number":
				typeStr = "number";
				break;
			case "boolean":
				typeStr = "boolean";
				break;
			case "url":
				typeStr = "string";
				break;
			case "email":
				typeStr = "string";
				break;
			case "json":
				typeStr = "unknown";
				break;
		}

		if (def.enum && def.enum.length > 0) {
			typeStr = def.enum.map((v) => `"${v}"`).join(" | ");
		}

		if (def.nullable) {
			typeStr += " | null";
		}

		const optional = !def.required ? "?" : "";
		const comment = def.description ? `  /** ${def.description} */\n` : "";
		lines.push(`${comment}  ${key}${optional}: ${typeStr};`);
	}

	lines.push("};");

	return lines.join("\n");
};

export const generateZodSchema = (
	schema: Schema,
	schemaName = "envSchema",
): string => {
	const lines: string[] = [];

	lines.push(`import { z } from "zod";`);
	lines.push("");
	lines.push(`export const ${schemaName} = z.object({`);

	for (const [key, def] of Object.entries(schema)) {
		let zodType = "";

		switch (def.type) {
			case "string":
				zodType = "z.string()";
				break;
			case "number":
				zodType = "z.number()";
				break;
			case "boolean":
				zodType = "z.boolean()";
				break;
			case "url":
				zodType = "z.string().url()";
				break;
			case "email":
				zodType = "z.string().email()";
				break;
			case "json":
				zodType = "z.unknown()";
				break;
		}

		if (def.enum && def.enum.length > 0) {
			zodType = `z.enum([${def.enum.map((v) => `"${v}"`).join(", ")}])`;
		}

		if (def.nullable) {
			zodType += ".nullable()";
		}

		if (!def.required) {
			zodType += ".optional()";
		}

		const comment = def.description ? `  // ${def.description}\n` : "";
		lines.push(`${comment}  ${key}: ${zodType},`);
	}

	lines.push("});");

	return lines.join("\n");
};

export const inferSchemaFromEnv = (
	env: Record<string, string>,
): Schema => {
	const schema: Schema = {};

	for (const [key, value] of Object.entries(env)) {
		const inferred = inferType(value);
		schema[key] = inferred;
	}

	return schema;
};

const inferType = (value: string): TypeDefinition => {
	if (value === "true" || value === "false") {
		return { type: "boolean" };
	}

	if (!isNaN(Number(value))) {
		return { type: "number" };
	}

	if (value.startsWith("http://") || value.startsWith("https://")) {
		return { type: "url" };
	}

	if (value.includes("@") && value.includes(".")) {
		return { type: "email" };
	}

	if (value.startsWith("{") || value.startsWith("[")) {
		return { type: "json" };
	}

	return { type: "string" };
};
