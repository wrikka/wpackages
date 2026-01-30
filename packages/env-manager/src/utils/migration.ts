import * as fs from "node:fs";
import * as path from "node:path";

export type Migration = {
	name: string;
	version: string;
	description: string;
	up: (env: Record<string, string>) => Record<string, string>;
	down: (env: Record<string, string>) => Record<string, string>;
};

export type MigrationState = {
	version: string;
	applied: string[];
};

const MIGRATIONS_FILE = ".env-migrations.json";
const STATE_FILE = ".env-migration-state.json";

export const createMigration = (
	name: string,
	version: string,
	description: string,
	up: (env: Record<string, string>) => Record<string, string>,
	down: (env: Record<string, string>) => Record<string, string>,
): Migration => ({
	name,
	version,
	description,
	up,
	down,
});

export const saveMigration = (migration: Migration, directory = "."): void => {
	const dir = path.resolve(process.cwd(), directory);
	const filePath = path.join(dir, MIGRATIONS_FILE);

	let migrations: Migration[] = [];
	if (fs.existsSync(filePath)) {
		const content = fs.readFileSync(filePath, "utf8");
		migrations = JSON.parse(content) as Migration[];
	}

	migrations.push(migration);
	fs.writeFileSync(filePath, JSON.stringify(migrations, null, 2), "utf8");
};

export const loadMigrations = (directory = "."): Migration[] => {
	const filePath = path.resolve(process.cwd(), directory, MIGRATIONS_FILE);

	if (!fs.existsSync(filePath)) {
		return [];
	}

	const content = fs.readFileSync(filePath, "utf8");
	return JSON.parse(content) as Migration[];
};

export const loadMigrationState = (directory = "."): MigrationState => {
	const filePath = path.resolve(process.cwd(), directory, STATE_FILE);

	if (!fs.existsSync(filePath)) {
		return { version: "0.0.0", applied: [] };
	}

	const content = fs.readFileSync(filePath, "utf8");
	return JSON.parse(content) as MigrationState;
};

export const saveMigrationState = (state: MigrationState, directory = "."): void => {
	const filePath = path.resolve(process.cwd(), directory, STATE_FILE);
	fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8");
};

export const applyMigration = (
	env: Record<string, string>,
	migration: Migration,
): Record<string, string> => {
	return migration.up(env);
};

export const rollbackMigration = (
	env: Record<string, string>,
	migration: Migration,
): Record<string, string> => {
	return migration.down(env);
};

export const migrateUp = (
	env: Record<string, string>,
	targetVersion?: string,
	directory = ".",
): { env: Record<string, string>; applied: Migration[] } => {
	const migrations = loadMigrations(directory);
	const state = loadMigrationState(directory);
	const applied: Migration[] = [];

	for (const migration of migrations) {
		if (state.applied.includes(migration.name)) continue;
		if (targetVersion && migration.version > targetVersion) continue;

		env = applyMigration(env, migration);
		state.applied.push(migration.name);
		applied.push(migration);
	}

	if (applied.length > 0) {
		state.version = applied[applied.length - 1].version;
		saveMigrationState(state, directory);
	}

	return { env, applied };
};

export const migrateDown = (
	env: Record<string, string>,
	targetVersion?: string,
	directory = ".",
): { env: Record<string, string>; rolledBack: Migration[] } => {
	const migrations = loadMigrations(directory).reverse();
	const state = loadMigrationState(directory);
	const rolledBack: Migration[] = [];

	for (const migration of migrations) {
		if (!state.applied.includes(migration.name)) continue;
		if (targetVersion && migration.version <= targetVersion) break;

		env = rollbackMigration(env, migration);
		state.applied = state.applied.filter((n) => n !== migration.name);
		rolledBack.push(migration);
	}

	if (rolledBack.length > 0) {
		const remainingApplied = loadMigrations(directory).filter((m) => state.applied.includes(m.name));
		state.version = remainingApplied.length > 0 ? remainingApplied[remainingApplied.length - 1].version : "0.0.0";
		saveMigrationState(state, directory);
	}

	return { env, rolledBack };
};

export const getMigrationStatus = (directory = "."): {
	currentVersion: string;
	pending: Migration[];
	applied: Migration[];
} => {
	const migrations = loadMigrations(directory);
	const state = loadMigrationState(directory);
	const applied = migrations.filter((m) => state.applied.includes(m.name));
	const pending = migrations.filter((m) => !state.applied.includes(m.name));

	return {
		currentVersion: state.version,
		pending,
		applied,
	};
};
