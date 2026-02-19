import type { ParsedEnv } from "../types/env";

/**
 * Parse .env file content
 */
export const parseEnvContent = (content: string): ParsedEnv => {
	const result: ParsedEnv = {};
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const currentLine = lines[i];
		if (!currentLine) continue;

		let line = currentLine.trim();

		// Skip empty lines and comments
		if (!line || line.startsWith("#")) continue;

		// Parse key=value
		const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
		if (!match) continue;

		const [, key, rawValue] = match;
		let value = rawValue ?? "";

		// Handle multi-line values (quoted)
		if (value && (value.startsWith("\"") || value.startsWith("'")) && !value.endsWith(value[0]!)) {
			const quote = value[0]!;
			while (i < lines.length - 1) {
				i++;
				const nextLine = lines[i];
				if (nextLine) {
					value += "\n" + nextLine;
				}
				if (value.endsWith(quote)) break;
			}
		}

		if (key) {
			result[key] = unquoteValue(value);
		}
	}

	return result;
};

/**
 * Unquote value (remove surrounding quotes)
 */
const unquoteValue = (value: string): string => {
	value = value.trim();

	// Remove comments after value
	const commentIndex = value.search(/\s+#/);
	if (commentIndex !== -1) {
		value = value.substring(0, commentIndex).trim();
	}

	// Remove quotes
	if (
		(value.startsWith("\"") && value.endsWith("\""))
		|| (value.startsWith("'") && value.endsWith("'"))
	) {
		value = value.slice(1, -1);
	}

	// Unescape characters
	return value
		.replace(/\\n/g, "\n")
		.replace(/\\r/g, "\r")
		.replace(/\\t/g, "\t")
		.replace(/\\\\/g, "\\");
};

/**
 * Serialize env to .env format
 */
export const serializeEnv = (env: ParsedEnv): string => {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(env)) {
		const quotedValue = quoteValue(value);
		lines.push(`${key}=${quotedValue}`);
	}

	return lines.join("\n");
};

/**
 * Quote value if needed
 */
const quoteValue = (value: string): string => {
	// Quote if contains special characters or whitespace
	if (/[\s#"'$\\]/.test(value) || value.includes("\n")) {
		const escaped = value
			.replace(/\\/g, "\\\\")
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/\t/g, "\\t")
			.replace(/"/g, "\\\"");
		return `"${escaped}"`;
	}

	return value;
};

/**
 * Merge multiple parsed envs (later ones override earlier ones)
 */
export const mergeEnvs = (...envs: ParsedEnv[]): ParsedEnv => {
	return Object.assign({}, ...envs);
};
