/**
 * Type-safe environment variable access.
 * Returns the value of an environment variable at build time with automatic type conversion.
 *
 * @param key - The environment variable name
 * @param defaultValue - Optional default value if the variable is not set
 * @returns The environment variable value with inferred type
 * @throws Error if the environment variable is not set and no default is provided
 *
 * @example
 * ```typescript
 * // String (default)
 * const apiKey = env("API_KEY");
 *
 * // Number - automatically converts
 * const port = env<number>("PORT", "3000");
 *
 * // Boolean - converts "true"/"false" to boolean
 * const debug = env<boolean>("DEBUG", "false");
 *
 * // JSON - parses JSON string
 * const config = env<Record<string, unknown>>("CONFIG", '{}');
 * ```
 */
export const env = Bun.macro(<T extends string | number | boolean | Record<string, unknown>>(
	key: string,
	defaultValue?: string,
) => {
	const value = process.env[key];
	const rawValue = value ?? defaultValue;

	if (rawValue === undefined) {
		throw new Error(`Environment variable "${key}" is not set.`);
	}

	// Type conversion based on generic type
	if (typeof rawValue === "string") {
		// Try to infer type from the value
		if (rawValue === "true") return JSON.stringify(true as T);
		if (rawValue === "false") return JSON.stringify(false as T);
		if (!Number.isNaN(Number(rawValue))) return JSON.stringify(Number(rawValue) as T);
		try {
			const parsed = JSON.parse(rawValue);
			if (typeof parsed === "object") return JSON.stringify(parsed as T);
		} catch {
			// Not JSON, keep as string
		}
	}

	return JSON.stringify(rawValue as T);
});

/**
 * Type-safe environment variable access with explicit type.
 *
 * @param key - The environment variable name
 * @param type - The expected type ("string", "number", "boolean", "json")
 * @param defaultValue - Optional default value if the variable is not set
 * @returns The environment variable value with the specified type
 * @throws Error if the environment variable is not set or type conversion fails
 *
 * @example
 * ```typescript
 * const port = envTyped("PORT", "number", "3000");
 * const debug = envTyped("DEBUG", "boolean", "false");
 * const config = envTyped("CONFIG", "json", '{}');
 * ```
 */
export const envTyped = Bun.macro(
	(key: string, type: "string" | "number" | "boolean" | "json", defaultValue?: string) => {
		const value = process.env[key];
		const rawValue = value ?? defaultValue;

		if (rawValue === undefined) {
			throw new Error(`Environment variable "${key}" is not set.`);
		}

		let converted: unknown = rawValue;

		switch (type) {
			case "number":
				converted = Number(rawValue);
				if (Number.isNaN(converted)) {
					throw new Error(`Environment variable "${key}" is not a valid number: ${rawValue}`);
				}
				break;
			case "boolean":
				converted = rawValue === "true";
				break;
			case "json":
				try {
					converted = JSON.parse(rawValue);
				} catch {
					throw new Error(
						`Environment variable "${key}" is not valid JSON: ${rawValue}`,
					);
				}
				break;
			case "string":
			default:
				converted = rawValue;
				break;
		}

		return JSON.stringify(converted);
	},
);
