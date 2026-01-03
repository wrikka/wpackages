/**
 * Environment Variable Mapper - Pure Functions
 * Map environment variables to command options
 */

import type { EnvMapping, OptionValue } from "../types";
import { camelCase } from "./index";

// Simple Result type
type ResultType<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

/**
 * Map environment variables to options
 */
export const mapEnvToOptions = (
	mapping: EnvMapping,
	env: Readonly<Record<string, string | undefined>> = process.env,
): Record<string, OptionValue> => {
	const options: Record<string, OptionValue> = {};

	for (const [envKey, optionKey] of Object.entries(mapping)) {
		const value = env[envKey];
		if (value !== undefined && typeof value === "string") {
			const camelKey = camelCase(optionKey);
			options[camelKey] = parseEnvValue(value);
		}
	}

	return options;
};

/**
 * Parse environment variable value
 */
const parseEnvValue = (value: string): OptionValue => {
	if (value.toLowerCase() === "true") return true;
	if (value.toLowerCase() === "false") return false;

	const num = Number(value);
	if (!Number.isNaN(num)) return num;

	if (value.includes(",")) {
		return value.split(",").map((v) => v.trim());
	}

	return value;
};

/**
 * Validate environment variables
 */
export const validateEnv = (
	required: readonly string[],
	env: Readonly<Record<string, string | undefined>> = process.env,
): ResultType<string, void> => {
	const missing = required.filter((key) => !env[key]);

	if (missing.length > 0) {
		return {
			_tag: "Failure",
			error: `Missing required environment variables: ${missing.join(", ")}`,
		};
	}

	return { _tag: "Success", value: undefined };
};
