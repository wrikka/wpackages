import type { EnvConfig, EnvSchema, EnvVariable, ParsedEnv } from "../../types/env";
import { decryptValue, encryptValue, expandValue } from "../../utils";

export const expand = (value: string, envData: ParsedEnv): string => {
	return expandValue(value, envData);
};

export const encrypt = (value: string, config: EnvConfig): string => {
	if (!config.encryption) {
		throw new Error("Encryption not configured");
	}
	return encryptValue(value, config.encryption);
};

export const decrypt = (value: string, config: EnvConfig): string => {
	if (!config.encryption) {
		throw new Error("Encryption not configured");
	}
	return decryptValue(value, config.encryption);
};

export const toObject = (envData: ParsedEnv): Record<string, unknown> => {
	return { ...envData };
};

export const generateExample = <T = Record<string, unknown>>(
	schema: EnvSchema<T> | undefined,
): string => {
	if (!schema) return "";

	const lines: string[] = [];
	lines.push("# Environment Variables");
	lines.push("# Generated from schema\n");

	for (const [key, definition] of Object.entries(schema)) {
		const def = definition as EnvVariable<unknown>;
		// Add description
		if (def.description) {
			lines.push(`# ${def.description}`);
		}

		// Add type and required info
		const metadata: string[] = [];
		metadata.push(`type: ${def.type}`);
		if (def.required) metadata.push("required");
		if (def.choices) {
			metadata.push(`choices: ${def.choices.join(", ")}`);
		}

		lines.push(`# ${metadata.join(", ")}`);

		// Add example value
		const exampleValue = def.default
			|| (def.sensitive ? "***SENSITIVE***" : `your_${key.toLowerCase()}`);

		lines.push(`${key}=${exampleValue}`);
		lines.push("");
	}

	return lines.join("\n");
};
