import { err, ok } from "@wpackages/functional";
import { unwatchFile, watchFile } from "node:fs";
import { join } from "node:path";
import { DEFAULT_ENV_CONFIG, ENV_PATHS } from "../constant/defaults.const";
import type { EnvConfig, EnvManager, EnvSchema, ParsedEnv, Result, ValidationResult } from "../types/env";
import { decryptValue, expandEnv } from "../utils";
import * as Getters from "./env/getters";
import { loadEnvFromPaths } from "./env/loader";
import * as Utils from "./env/utils";
import * as Validation from "./env/validation";

export const createEnvManager = <T = Record<string, unknown>>(
	config: Partial<EnvConfig> = {},
	schema?: EnvSchema<T>,
): EnvManager<T> => {
	const fullConfig: EnvConfig = { ...DEFAULT_ENV_CONFIG, ...config };
	const env = fullConfig.environment || process.env.NODE_ENV || "development";
	const envKey = env as keyof typeof ENV_PATHS;
	const defaultPaths: string[] = (ENV_PATHS[envKey] ?? ENV_PATHS["development"]) as string[];
	let paths: string[] = (fullConfig.paths && fullConfig.paths.length > 0) ? fullConfig.paths : defaultPaths;

	let envData: ParsedEnv = {};
	let validationCache: ValidationResult | null = null;

	const load = (): Result<void, Error> => {
		try {
			envData = loadEnvFromPaths(paths, fullConfig);

			if (fullConfig.expand) {
				envData = expandEnv(envData);
			}

			if (fullConfig.encryption?.enabled) {
				for (const [key, value] of Object.entries(envData)) {
					envData[key] = decryptValue(value, fullConfig.encryption);
				}
			}

			if (fullConfig.override) {
				Object.assign(process.env, envData);
			} else {
				for (const [key, value] of Object.entries(envData)) {
					if (!(key in process.env)) {
						process.env[key] = value;
					}
				}
			}

			if (fullConfig.validate && schema) {
				const { validation } = Validation.validate(envData, schema, validationCache, false);
				validationCache = validation;

				if (!validation.valid && fullConfig.strict) {
					const errorMessages = validation.errors.map((e) => e.message).join(", ");
					return err(new Error(`Environment validation failed: ${errorMessages}`)) as Result<void, Error>;
				}
			}

			if (fullConfig.watch) {
				paths.forEach(path => watchFile(join(process.cwd(), path), reload));
			}

			return ok(undefined) as Result<void, Error>;
		} catch (error) {
			return err(error as Error) as Result<void, Error>;
		}
	};

	const reload = (): Result<void, Error> => {
		if (fullConfig.watch) {
			paths.forEach(path => unwatchFile(join(process.cwd(), path)));
		}
		validationCache = null;
		return load();
	};

	const manager: EnvManager<T> = {
		config: fullConfig,
		load,
		reload,
		schema: schema || undefined,
		get: <K extends keyof T>(key: K): T[K] | undefined => Getters.get(envData, schema, key),
		getAll: () => Getters.getAll(envData, schema),
		getRequired: <K extends keyof T>(key: K): Result<T[K], Error> => Getters.getRequired(envData, schema, key),
		getString: (key: keyof T, defaultValue?: string) => Getters.getString(envData, schema, key, defaultValue),
		getNumber: (key: keyof T, defaultValue?: number) => Getters.getNumber(envData, schema, key, defaultValue),
		getBoolean: (key: keyof T, defaultValue?: boolean) => Getters.getBoolean(envData, schema, key, defaultValue),
		getArray: (key: keyof T, separator?: string) => Getters.getArray(envData, schema, key, separator),
		getJson: <J = unknown>(key: keyof T) => Getters.getJson<J, T>(envData, schema, key),
		has: (key: keyof T): boolean => (key as string) in envData,
		set: <K extends keyof T>(key: K, value: T[K]): void => {
			envData[key as string] = String(value);
			process.env[key as string] = String(value);
			validationCache = null;
		},
		validate: (): Result<ValidationResult, Error> => {
			const { validation, result } = Validation.validate(envData, schema, validationCache, fullConfig.cache || false);
			validationCache = validation;
			return result;
		},
		isValid: (): boolean => Validation.isValid(envData, schema),
		expand: (value: string): string => Utils.expand(value, envData),
		encrypt: (value: string): string => Utils.encrypt(value, fullConfig),
		decrypt: (value: string): string => Utils.decrypt(value, fullConfig),
		toObject: (): Record<string, unknown> => Utils.toObject(envData),
		generateExample: (): string => Utils.generateExample(schema),
	};
	return manager;
};
