import { err, ok } from "@wpackages/functional";
import { existsSync, readFileSync, unwatchFile, watchFile } from "node:fs";
import { join } from "node:path";
import { DEFAULT_ENV_CONFIG, ENV_PATHS } from "../constant/defaults.const";
import type { EnvConfig, EnvManager, EnvSchema, EnvVariable, ParsedEnv, ValidationResult } from "../types/env";
import type { Result } from "../types/env";
import {
	castValue,
	decryptValue,
	encryptValue,
	expandEnv,
	expandValue,
	mergeEnvs,
	parseEnvContent,
	validateEnv,
} from "../utils";

/**
 * Create Environment Manager
 */
export const createEnvManager = <T = Record<string, unknown>>(
	config: Partial<EnvConfig> = {},
	schema?: EnvSchema<T>,
): EnvManager<T> => {
	// Merge config with defaults
	const fullConfig: EnvConfig = {
		...DEFAULT_ENV_CONFIG,
		...config,
	};

	// Determine environment
	const env = fullConfig.environment || process.env.NODE_ENV || "development";

	// Determine paths
	const envKey = env as keyof typeof ENV_PATHS;
	const defaultPaths: string[] = (ENV_PATHS[envKey] ?? ENV_PATHS["development"]) as string[];
	let paths: string[] = (fullConfig.paths && fullConfig.paths.length > 0) ? fullConfig.paths : defaultPaths;

	// Storage
	let envData: ParsedEnv = {};
	let validationCache: ReturnType<typeof validateEnv> | null = null;

	/**
	 * Load environment variables
	 */
	const load = (): Result<void, Error> => {
		try {
			const loadedEnvs: ParsedEnv[] = [];

			// Load from files
			for (const path of paths) {
				const fullPath = join(process.cwd(), path);

				if (existsSync(fullPath)) {
					const content = readFileSync(fullPath, fullConfig.encoding || "utf8");
					const parsed = parseEnvContent(content);
					loadedEnvs.push(parsed);
				}
			}

			// Merge all envs
			envData = mergeEnvs(...loadedEnvs, process.env as ParsedEnv);

			// Expand variables
			if (fullConfig.expand) {
				envData = expandEnv(envData);
			}

			// Decrypt values
			if (fullConfig.encryption?.enabled) {
				for (const [key, value] of Object.entries(envData)) {
					envData[key] = decryptValue(value, fullConfig.encryption);
				}
			}

			// Apply to process.env
			if (fullConfig.override) {
				Object.assign(process.env, envData);
			} else {
				for (const [key, value] of Object.entries(envData)) {
					if (!(key in process.env)) {
						process.env[key] = value;
					}
				}
			}

			// Validate
			if (fullConfig.validate && schema) {
				const validation = validateEnv(envData, schema);
				validationCache = validation;

				if (!validation.valid && fullConfig.strict) {
					const errorMessages = validation.errors
						.map((e) => e.message)
						.join(", ");
					return err(new Error(`Environment validation failed: ${errorMessages}`)) as Result<void, Error>;
				}
			}

			// Watch for changes
			if (fullConfig.watch) {
				for (const path of paths) {
					const fullPath = join(process.cwd(), path);
					if (existsSync(fullPath)) {
						watchFile(fullPath, () => {
							reload();
						});
					}
				}
			}

			return ok(undefined) as Result<void, Error>;
		} catch (error) {
			return err(error as Error) as Result<void, Error>;
		}
	};

	/**
	 * Reload environment variables
	 */
	const reload = (): Result<void, Error> => {
		// Unwatch files
		if (fullConfig.watch) {
			for (const path of paths) {
				const fullPath = join(process.cwd(), path);
				unwatchFile(fullPath);
			}
		}

		// Clear cache
		validationCache = null;

		// Reload
		return load();
	};

	/**
	 * Get value
	 */
	const get = <K extends keyof T>(key: K): T[K] | undefined => {
		const value = envData[key as string];

		if (value === undefined) return undefined;

		if (schema && schema[key]) {
			const definition = schema[key];

			// Apply transform
			if (definition.transform) {
				return definition.transform(value) as T[K];
			}

			// Cast to type
			return castValue<T[K]>(value, definition.type);
		}

		return value as T[K];
	};

	/**
	 * Get required value
	 */
	const getRequired = <K extends keyof T>(key: K): Result<T[K], Error> => {
		const value = get(key);

		if (value === undefined) {
			return err(
				new Error(`Required environment variable '${String(key)}' is not set`),
			) as Result<T[K], Error>;
		}

		return ok(value) as Result<T[K], Error>;
	};

	/**
	 * Get all values
	 */
	const getAll = (): T => {
		const result: Record<string, unknown> = {};

		if (schema) {
			for (const key of Object.keys(schema)) {
				result[key] = get(key as keyof T);
			}
		} else {
			Object.assign(result, envData);
		}

		return result as T;
	};

	/**
	 * Set value
	 */
	const set = <K extends keyof T>(key: K, value: T[K]): void => {
		envData[key as string] = String(value);
		process.env[key as string] = String(value);
		validationCache = null;
	};

	/**
	 * Check if key exists
	 */
	const has = (key: keyof T): boolean => {
		return (key as string) in envData;
	};

	/**
	 * Validate environment
	 */
	const validate = (): Result<ValidationResult, Error> => {
		if (!schema) {
			return err(new Error("No schema provided for validation")) as Result<ValidationResult, Error>;
		}

		if (validationCache && fullConfig.cache) {
			return ok(validationCache) as Result<ValidationResult, Error>;
		}

		const validation = validateEnv(envData, schema);
		validationCache = validation;

		return ok(validation) as Result<ValidationResult, Error>;
	};

	/**
	 * Check if valid
	 */
	const isValid = (): boolean => {
		if (!schema) return true;

		const result = validate();
		if (result._tag === "Success") {
			const validation = result.value as unknown as ReturnType<typeof validateEnv>;
			return validation.valid;
		}
		return false;
	};

	/**
	 * Type-specific getters
	 */
	const getString = (key: keyof T, defaultValue?: string): string => {
		const value = get(key);
		return value !== undefined ? String(value) : defaultValue || "";
	};

	const getNumber = (key: keyof T, defaultValue?: number): number => {
		const value = get(key);
		return value !== undefined ? Number(value) : defaultValue || 0;
	};

	const getBoolean = (key: keyof T, defaultValue?: boolean): boolean => {
		const value = get(key);
		if (value === undefined) return defaultValue || false;

		const str = String(value).toLowerCase();
		return str === "true" || str === "1" || str === "yes" || str === "on";
	};

	const getArray = (key: keyof T, separator = ","): string[] => {
		const value = get(key);
		return value
			? String(value)
				.split(separator)
				.map((v) => v.trim())
			: [];
	};

	const getJson = <J = unknown>(key: keyof T): J | undefined => {
		const value = get(key);
		if (!value) return undefined;

		try {
			return JSON.parse(String(value)) as J;
		} catch {
			return undefined;
		}
	};

	/**
	 * Expand value
	 */
	const expand = (value: string): string => {
		return expandValue(value, envData);
	};

	/**
	 * Encrypt value
	 */
	const encrypt = (value: string): string => {
		if (!fullConfig.encryption) {
			throw new Error("Encryption not configured");
		}
		return encryptValue(value, fullConfig.encryption);
	};

	/**
	 * Decrypt value
	 */
	const decrypt = (value: string): string => {
		if (!fullConfig.encryption) {
			throw new Error("Encryption not configured");
		}
		return decryptValue(value, fullConfig.encryption);
	};

	/**
	 * Convert to plain object
	 */
	const toObject = (): Record<string, unknown> => {
		return { ...envData };
	};

	/**
	 * Generate example .env file
	 */
	const generateExample = (): string => {
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
				|| (def.sensitive
					? "***SENSITIVE***"
					: `your_${key.toLowerCase()}`);

			lines.push(`${key}=${exampleValue}`);
			lines.push("");
		}

		return lines.join("\n");
	};

	return {
		config: fullConfig,
		decrypt,
		encrypt,
		expand,
		generateExample,
		get,
		getAll,
		getArray,
		getBoolean,
		getJson,
		getNumber,
		getRequired,
		getString,
		has,
		isValid,
		load,
		reload,
		schema: schema || undefined,
		set,
		toObject,
		validate,
	};
};
