import type {
	MigrationHistory,
	MigrationManager,
	MigrationOptions,
	MigrationResult,
	MigrationScript,
} from "../types/migration.types";

export const createMigrationManager = (): MigrationManager => {
	const migrations: Map<string, MigrationScript> = new Map();
	const history: Map<string, MigrationHistory> = new Map();

	const addMigration = (script: MigrationScript): void => {
		const key = `${script.fromVersion}->${script.toVersion}`;
		migrations.set(key, script);
	};

	const getAvailableMigrations = (): readonly MigrationScript[] => {
		return Object.freeze(Array.from(migrations.values()));
	};

	const migrate = async (
		pluginId: string,
		toVersion: string,
		options: MigrationOptions = {},
	): Promise<MigrationResult> => {
		const pluginHistory = history.get(pluginId) ?? {
			pluginId,
			migrations: [],
		};

		const lastMigration = pluginHistory.migrations[pluginHistory.migrations.length - 1];
		const fromVersion = lastMigration?.toVersion ?? "0.0.0";

		if (fromVersion === toVersion) {
			return {
				success: true,
				fromVersion,
				toVersion,
				migratedAt: new Date(),
			};
		}

		const key = `${fromVersion}->${toVersion}`;
		const migration = migrations.get(key);

		if (!migration) {
			return {
				success: false,
				fromVersion,
				toVersion,
				migratedAt: new Date(),
				error: new Error(`No migration found from ${fromVersion} to ${toVersion}`),
			};
		}

		try {
			if (options.dryRun) {
				return {
					success: true,
					fromVersion,
					toVersion,
					migratedAt: new Date(),
				};
			}

			await migration.up({});

			const newHistory: MigrationHistory = {
				pluginId,
				migrations: [
					...pluginHistory.migrations,
					{
						fromVersion,
						toVersion,
						migratedAt: new Date(),
					},
				],
			};

			history.set(pluginId, newHistory);

			return {
				success: true,
				fromVersion,
				toVersion,
				migratedAt: new Date(),
			};
		} catch (error) {
			return {
				success: false,
				fromVersion,
				toVersion,
				migratedAt: new Date(),
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	};

	const rollback = async (pluginId: string, toVersion: string): Promise<MigrationResult> => {
		const pluginHistory = history.get(pluginId);

		if (!pluginHistory || pluginHistory.migrations.length === 0) {
			return {
				success: false,
				fromVersion: "unknown",
				toVersion,
				migratedAt: new Date(),
				error: new Error("No migration history found"),
			};
		}

		const targetMigration = pluginHistory.migrations.find((m) => m.toVersion === toVersion);

		if (!targetMigration) {
			return {
				success: false,
				fromVersion: "unknown",
				toVersion,
				migratedAt: new Date(),
				error: new Error(`Target version ${toVersion} not found in history`),
			};
		}

		const key = `${targetMigration.fromVersion}->${targetMigration.toVersion}`;
		const migration = migrations.get(key);

		if (!migration || !migration.down) {
			return {
				success: false,
				fromVersion: targetMigration.toVersion,
				toVersion: targetMigration.fromVersion,
				migratedAt: new Date(),
				error: new Error("Rollback not supported for this migration"),
			};
		}

		try {
			await migration.down({});

			const newHistory: MigrationHistory = {
				pluginId,
				migrations: pluginHistory.migrations.slice(0, -1),
			};

			history.set(pluginId, newHistory);

			return {
				success: true,
				fromVersion: targetMigration.toVersion,
				toVersion: targetMigration.fromVersion,
				migratedAt: new Date(),
				rolledBack: true,
			};
		} catch (error) {
			return {
				success: false,
				fromVersion: targetMigration.toVersion,
				toVersion: targetMigration.fromVersion,
				migratedAt: new Date(),
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	};

	const getHistory = (pluginId: string): MigrationHistory => {
		return (
			history.get(pluginId) ?? {
				pluginId,
				migrations: [],
			}
		);
	};

	const canMigrate = (fromVersion: string, toVersion: string): boolean => {
		const key = `${fromVersion}->${toVersion}`;
		return migrations.has(key);
	};

	return Object.freeze({
		addMigration,
		getAvailableMigrations,
		migrate,
		rollback,
		getHistory,
		canMigrate,
	});
};
