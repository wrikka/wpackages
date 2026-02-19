/**
 * Schema-based environment variable validation.
 * Validates environment variables against a schema at build time.
 *
 * @param schema - Schema object defining environment variables
 * @returns Validated environment variable values
 * @throws Error if validation fails or required variables are missing
 *
 * @example
 * // const config = envSchema({
 * //   API_KEY: { type: "string", required: true },
 * //   PORT: { type: "number", default: 3000 },
 * //   DEBUG: { type: "boolean", default: false }
 * // });
 */
export const envSchema = Bun.macro((schema: Record<string, EnvVarSchema>) => {
	const result: Record<string, unknown> = {};

	for (const [key, config] of Object.entries(schema)) {
		const value = process.env[key];

		if (value === undefined) {
			if (config.required) {
				throw new Error(`Environment variable "${key}" is required but not set.`);
			}
			if (config.default !== undefined) {
				result[key] = config.default;
			}
			continue;
		}

		let converted: unknown = value;

		switch (config.type) {
			case "number":
				converted = Number(value);
				if (Number.isNaN(converted)) {
					throw new Error(`Environment variable "${key}" must be a valid number: ${value}`);
				}
				break;
			case "boolean":
				converted = value === "true" || value === "1";
				break;
			case "json":
				try {
					converted = JSON.parse(value);
				} catch {
					throw new Error(`Environment variable "${key}" must be valid JSON: ${value}`);
				}
				break;
			case "string":
			default:
				converted = value;
				break;
		}

		if (config.validate && !config.validate(converted)) {
			throw new Error(`Environment variable "${key}" failed validation: ${value}`);
		}

		result[key] = converted;
	}

	return JSON.stringify(result);
});

/**
 * Schema definition for environment variables.
 */
interface EnvVarSchema {
	type: "string" | "number" | "boolean" | "json";
	required?: boolean;
	default?: unknown;
	validate?: (value: unknown) => boolean;
}
