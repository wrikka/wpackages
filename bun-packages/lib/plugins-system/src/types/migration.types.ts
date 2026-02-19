export interface MigrationScript {
	readonly fromVersion: string;
	readonly toVersion: string;
	readonly up: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
	readonly down?: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
	readonly description?: string;
}

export interface MigrationResult {
	readonly success: boolean;
	readonly fromVersion: string;
	readonly toVersion: string;
	readonly migratedAt: Date;
	readonly error?: Error;
	readonly rolledBack?: boolean;
}

export interface MigrationHistory {
	readonly pluginId: string;
	readonly migrations: readonly {
		readonly fromVersion: string;
		readonly toVersion: string;
		readonly migratedAt: Date;
	}[];
}

export interface MigrationOptions {
	readonly dryRun?: boolean;
	readonly backup?: boolean;
	readonly force?: boolean;
}

export interface MigrationManager {
	readonly addMigration: (script: MigrationScript) => void;
	readonly getAvailableMigrations: () => readonly MigrationScript[];
	readonly migrate: (
		pluginId: string,
		toVersion: string,
		options?: MigrationOptions,
	) => Promise<MigrationResult>;
	readonly rollback: (
		pluginId: string,
		toVersion: string,
	) => Promise<MigrationResult>;
	readonly getHistory: (pluginId: string) => MigrationHistory;
	readonly canMigrate: (
		fromVersion: string,
		toVersion: string,
	) => boolean;
}
