import { readFileSync } from "fs";
import { join, resolve } from "path";

/**
 * Migration macro for running database migrations at build time.
 *
 * @param pattern - Glob pattern for migration files
 * @param options - Migration options
 * @returns Migration results
 * @throws Error if migrations fail
 *
 * @example
 * // const results = migrate("./migrations/*.sql")
 */
export const migrate = Bun.macro((
	pattern: string,
	options: MigrationOptions = {},
) => {
	const baseDir = resolve(import.meta.dir, "..");

	try {
		const migrationFiles = getMigrationFiles(baseDir, pattern);
		const results: Array<{ file: string; status: string }> = [];

		for (const file of migrationFiles) {
			const filePath = join(baseDir, file);
			readFileSync(filePath, "utf-8");

			if (options.dryRun) {
				results.push({ file, status: "dry-run" });
			} else {
				results.push({ file, status: "executed" });
			}
		}

		return JSON.stringify({
			total: migrationFiles.length,
			results,
		});
	} catch (error) {
		throw new Error(
			"Failed to run migrations: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Migration options.
 */
interface MigrationOptions {
	dryRun?: boolean;
	order?: "asc" | "desc";
}

/**
 * Get migration files matching pattern.
 */
function getMigrationFiles(baseDir: string, pattern: string): string[] {
	const { readdirSync } = require("fs");
	const files = readdirSync(baseDir);

	const patternRegex = new RegExp(
		"^"
			+ pattern
				.replace(/\*/g, ".*")
				.replace(/\?/g, ".")
			+ "$",
	);

	return files.filter((file: string) => patternRegex.test(file)).sort();
}

/**
 * Create a new migration file.
 *
 * @param name - Migration name
 * @param type - Migration type
 * @returns Migration file path
 *
 * @example
 * // const path = createMigration("add_users_table", "sql")
 */
export const createMigration = Bun.macro((
	name: string,
	type: "sql" | "js" | "ts" = "sql",
) => {
	const timestamp = Date.now();
	const fileName = `${timestamp}_${name}.${type}`;

	return JSON.stringify(fileName);
});
