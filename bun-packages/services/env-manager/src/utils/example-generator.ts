import * as fs from "node:fs";
import * as path from "node:path";
import { isSensitiveKey, maskValue } from "@wpackages/config-manager/utils/encryption.utils";

export type ExampleGeneratorOptions = {
	outputPath?: string;
	maskSensitive?: boolean;
	includeComments?: boolean;
};

export const generateExample = (
	env: Record<string, unknown>,
	options: ExampleGeneratorOptions = {},
): string => {
	const {
		maskSensitive = true,
		includeComments = true,
	} = options;

	const lines: string[] = [];

	if (includeComments) {
		lines.push("# Environment Variables Example");
		lines.push("# Copy this file to .env and fill in the actual values");
		lines.push("");
	}

	const sortedKeys = Object.keys(env).sort();

	for (const key of sortedKeys) {
		const value = env[key];
		if (value === undefined || value === null) continue;

		const stringValue = String(value);
		const isSensitive = maskSensitive && isSensitiveKey(key);
		const maskedValue = isSensitive ? maskValue(stringValue) : getExampleValue(key, stringValue);

		if (includeComments) {
			lines.push(`# ${getCommentForVariable(key, isSensitive)}`);
		}

		lines.push(`${key}=${maskedValue}`);
		lines.push("");
	}

	return lines.join("\n");
};

const getExampleValue = (key: string): string => {
	const lowerKey = key.toLowerCase();

	if (lowerKey.includes("port")) {
		return "3000";
	}
	if (lowerKey.includes("host") || lowerKey.includes("url")) {
		return "http://localhost:3000";
	}
	if (lowerKey.includes("email")) {
		return "user@example.com";
	}
	if (lowerKey.includes("enabled") || lowerKey.includes("debug")) {
		return "true";
	}
	if (lowerKey.includes("env")) {
		return "development";
	}

	return "your_value_here";
};

const getCommentForVariable = (key: string, isSensitive: boolean): string => {
	const lowerKey = key.toLowerCase();

	if (isSensitive) {
		return `${key} - Sensitive value (masked)`;
	}

	if (lowerKey.includes("port")) {
		return `${key} - Server port number`;
	}
	if (lowerKey.includes("host") || lowerKey.includes("url")) {
		return `${key} - Server host or base URL`;
	}
	if (lowerKey.includes("email")) {
		return `${key} - Email address`;
	}
	if (lowerKey.includes("api") || lowerKey.includes("key")) {
		return `${key} - API key or token`;
	}
	if (lowerKey.includes("database") || lowerKey.includes("db")) {
		return `${key} - Database connection string`;
	}
	if (lowerKey.includes("env")) {
		return `${key} - Environment (development, production, test)`;
	}

	return `${key} - Environment variable`;
};

export const writeExampleFile = (
	env: Record<string, unknown>,
	outputPath: string,
	options: ExampleGeneratorOptions = {},
): void => {
	const content = generateExample(env, options);
	const absolutePath = path.resolve(process.cwd(), outputPath);
	const dir = path.dirname(absolutePath);

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	fs.writeFileSync(absolutePath, content, "utf8");
};
