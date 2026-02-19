/**
 * Type-safe environment variable access that throws if not set.
 * Unlike env(), this macro does not accept a default value and will throw
 * an error at build time if the environment variable is not set.
 *
 * @param key - The environment variable name
 * @returns The environment variable value with inferred type
 * @throws Error if the environment variable is not set
 *
 * @example
 * const apiKey = envRequired("API_KEY");
 * // Error at build time if API_KEY is not set
 */
export const envRequired = Bun.macro(<T extends string | number | boolean | Record<string, unknown>>(key: string) => {
	const value = process.env[key];

	if (value === undefined) {
		throw new Error(`Environment variable "${key}" is required but not set.`);
	}

	let converted: unknown = value;

	if (typeof value === "string") {
		if (value === "true") converted = true;
		else if (value === "false") converted = false;
		else if (!Number.isNaN(Number(value))) converted = Number(value);
		else {
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed === "object") converted = parsed;
			} catch {
				converted = value;
			}
		}
	}

	return JSON.stringify(converted as T);
});
