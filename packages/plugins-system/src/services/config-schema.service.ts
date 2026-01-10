import type {
	ConfigMigration,
	ConfigSchema,
	ConfigSchemaManager,
	ConfigValidationResult,
} from "../types/config-schema.types";

export const createConfigSchemaManager = (schema: ConfigSchema): ConfigSchemaManager => {
	const migrations: Map<string, ConfigMigration> = new Map();

	const validate = (
		_schema: ConfigSchema,
		config: Record<string, unknown>,
	): ConfigValidationResult => {
		const errors: Array<{ readonly path: string; readonly message: string; readonly value?: unknown }> = [];

		for (const [key, property] of Object.entries(_schema.properties)) {
			const value = config[key];

			if (property.required && value === undefined) {
				errors.push({ path: key, message: `${key} is required` });
				continue;
			}

			if (value !== undefined) {
				if (property.type === "string" && typeof value !== "string") {
					errors.push({ path: key, message: `${key} must be a string`, value });
				} else if (property.type === "number" && typeof value !== "number") {
					errors.push({ path: key, message: `${key} must be a number`, value });
				} else if (property.type === "boolean" && typeof value !== "boolean") {
					errors.push({ path: key, message: `${key} must be a boolean`, value });
				} else if (property.type === "array" && !Array.isArray(value)) {
					errors.push({ path: key, message: `${key} must be an array`, value });
				} else if (property.enum && !property.enum.includes(value as string)) {
					errors.push({
						path: key,
						message: `${key} must be one of: ${property.enum.join(", ")}`,
						value,
					});
				}
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors.length > 0 ? Object.freeze(errors) : undefined,
		};
	};

	const applyDefaults = (
		_schema: ConfigSchema,
		config: Record<string, unknown>,
	): Record<string, unknown> => {
		const result = { ...config };

		for (const [key, property] of Object.entries(_schema.properties)) {
			if (result[key] === undefined && property.default !== undefined) {
				result[key] = property.default;
			}
		}

		return Object.freeze(result);
	};

	const addMigration = (migration: ConfigMigration): void => {
		const key = `${migration.fromVersion}->${migration.toVersion}`;
		migrations.set(key, migration);
	};

	const migrate = (
		config: Record<string, unknown>,
		fromVersion: string,
		toVersion: string,
	): Record<string, unknown> => {
		let currentConfig = { ...config };
		let currentVersion = fromVersion;

		while (currentVersion !== toVersion) {
			const key = `${currentVersion}->${toVersion}`;
			const migration = migrations.get(key);

			if (!migration) {
				break;
			}

			currentConfig = migration.migrate(currentConfig);
			currentVersion = migration.toVersion;
		}

		return currentConfig;
	};

	const getSchema = (): ConfigSchema => {
		return schema;
	};

	return Object.freeze({
		validate,
		applyDefaults,
		addMigration,
		migrate,
		getSchema,
	});
};
