import type { TableDefinition } from "../schema/schema";
import type { Dialect } from "../core/dialect";
import { createDialect, type DatabaseType } from "../core/dialect";

export interface Migration {
	name: string;
	up: string;
	down: string;
	timestamp: number;
}

export interface MigrationOptions {
	dbType: DatabaseType;
	tableName: string;
}

export class MigrationGenerator {
	private dialect: Dialect;

	constructor(dbType: DatabaseType) {
		this.dialect = createDialect(dbType);
	}

	generateCreateTable(table: TableDefinition): string {
		const columns = Object.entries(table.schema).map(([name, def]) => {
			const columnDef = this.generateColumnDefinition(name, def);
			return columnDef;
		});

		const sql = `CREATE TABLE ${this.dialect.escapeIdentifier(table.name)} (\n  ${columns.join(",\n  ")}\n);`;
		return sql;
	}

	generateDropTable(tableName: string): string {
		return `DROP TABLE ${this.dialect.escapeIdentifier(tableName)};`;
	}

	generateAddColumn(tableName: string, columnName: string, definition: any): string {
		const columnDef = this.generateColumnDefinition(columnName, definition);
		return `ALTER TABLE ${this.dialect.escapeIdentifier(tableName)} ADD COLUMN ${columnDef};`;
	}

	generateDropColumn(tableName: string, columnName: string): string {
		return `ALTER TABLE ${this.dialect.escapeIdentifier(tableName)} DROP COLUMN ${this.dialect.escapeIdentifier(columnName)};`;
	}

	generateAddIndex(tableName: string, indexName: string, columns: string[], unique: boolean = false): string {
		const uniqueStr = unique ? "UNIQUE " : "";
		const columnList = columns.map((col) => this.dialect.escapeIdentifier(col)).join(", ");
		return `CREATE ${uniqueStr}INDEX ${this.dialect.escapeIdentifier(indexName)} ON ${this.dialect.escapeIdentifier(tableName)} (${columnList});`;
	}

	generateDropIndex(indexName: string): string {
		return `DROP INDEX ${this.dialect.escapeIdentifier(indexName)};`;
	}

	private generateColumnDefinition(name: string, def: any): string {
		const parts: string[] = [];

		parts.push(this.dialect.escapeIdentifier(name));
		parts.push(this.dialect.getColumnType(def.type, def.length));

		if (def.primaryKey) {
			parts.push("PRIMARY KEY");
		}

		if (def.autoIncrement) {
			const isPostgres = this.dialect.constructor.name === "PostgreSQLDialect";
			if (isPostgres) {
				parts.push("SERIAL");
			} else {
				parts.push("AUTO_INCREMENT");
			}
		}

		if (!def.nullable && !def.primaryKey) {
			parts.push("NOT NULL");
		}

		if (def.unique) {
			parts.push("UNIQUE");
		}

		if (def.defaultValue !== undefined) {
			parts.push(`DEFAULT ${this.dialect.escapeValue(def.defaultValue)}`);
		}

		return parts.join(" ");
	}
}

export class MigrationRunner {
	constructor(private dbType: DatabaseType) {}

	async runMigration(migration: Migration, execute: (sql: string) => Promise<void>): Promise<void> {
		await execute(migration.up);
	}

	async rollbackMigration(migration: Migration, execute: (sql: string) => Promise<void>): Promise<void> {
		await execute(migration.down);
	}
}

export function createMigrationGenerator(dbType: DatabaseType): MigrationGenerator {
	return new MigrationGenerator(dbType);
}

export function createMigrationRunner(dbType: DatabaseType): MigrationRunner {
	return new MigrationRunner(dbType);
}
