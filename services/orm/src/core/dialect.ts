import type { DatabaseType } from "./types";

export interface Dialect {
	escapeIdentifier(name: string): string;
	escapeValue(value: unknown): string;
	getColumnType(type: string, length?: number): string;
	getLimitClause(limit: number, offset?: number): string;
	supportsReturning: boolean;
}

export class PostgreSQLDialect implements Dialect {
	escapeIdentifier(name: string): string {
		return `"${name.replace(/"/g, '""')}"`;
	}

	escapeValue(value: unknown): string {
		if (value === null) return "NULL";
		if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
		if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
		if (typeof value === "number") return String(value);
		if (value instanceof Date) return `'${value.toISOString()}'`;
		return String(value);
	}

	getColumnType(type: string, length?: number): string {
		const typeMap: Record<string, string> = {
			integer: "INTEGER",
			bigint: "BIGINT",
			text: "TEXT",
			varchar: length ? `VARCHAR(${length})` : "VARCHAR(255)",
			boolean: "BOOLEAN",
			decimal: "DECIMAL",
			float: "DOUBLE PRECISION",
			date: "DATE",
			datetime: "TIMESTAMP",
			timestamp: "TIMESTAMP",
			json: "JSONB",
			uuid: "UUID",
			enum: "TEXT",
		};
		return typeMap[type] || "TEXT";
	}

	getLimitClause(limit: number, offset?: number): string {
		if (offset !== undefined) {
			return `LIMIT ${limit} OFFSET ${offset}`;
		}
		return `LIMIT ${limit}`;
	}

	supportsReturning = true;
}

export class MySQLDialect implements Dialect {
	escapeIdentifier(name: string): string {
		return `\`${name.replace(/`/g, "``")}\``;
	}

	escapeValue(value: unknown): string {
		if (value === null) return "NULL";
		if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;
		if (typeof value === "boolean") return value ? "1" : "0";
		if (typeof value === "number") return String(value);
		if (value instanceof Date) return `'${value.toISOString()}'`;
		return String(value);
	}

	getColumnType(type: string, length?: number): string {
		const typeMap: Record<string, string> = {
			integer: "INT",
			bigint: "BIGINT",
			text: "TEXT",
			varchar: length ? `VARCHAR(${length})` : "VARCHAR(255)",
			boolean: "TINYINT(1)",
			decimal: "DECIMAL",
			float: "DOUBLE",
			date: "DATE",
			datetime: "DATETIME",
			timestamp: "TIMESTAMP",
			json: "JSON",
			uuid: "CHAR(36)",
			enum: "VARCHAR(255)",
		};
		return typeMap[type] || "TEXT";
	}

	getLimitClause(limit: number, offset?: number): string {
		if (offset !== undefined) {
			return `LIMIT ${offset}, ${limit}`;
		}
		return `LIMIT ${limit}`;
	}

	supportsReturning = false;
}

export class SQLiteDialect implements Dialect {
	escapeIdentifier(name: string): string {
		return `"${name.replace(/"/g, '""')}"`;
	}

	escapeValue(value: unknown): string {
		if (value === null) return "NULL";
		if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`;
		if (typeof value === "boolean") return value ? "1" : "0";
		if (typeof value === "number") return String(value);
		if (value instanceof Date) return `'${value.toISOString()}'`;
		return String(value);
	}

	getColumnType(type: string, length?: number): string {
		const typeMap: Record<string, string> = {
			integer: "INTEGER",
			bigint: "INTEGER",
			text: "TEXT",
			varchar: "TEXT",
			boolean: "INTEGER",
			decimal: "REAL",
			float: "REAL",
			date: "TEXT",
			datetime: "TEXT",
			timestamp: "TEXT",
			json: "TEXT",
			uuid: "TEXT",
			enum: "TEXT",
		};
		return typeMap[type] || "TEXT";
	}

	getLimitClause(limit: number, offset?: number): string {
		if (offset !== undefined) {
			return `LIMIT ${limit} OFFSET ${offset}`;
		}
		return `LIMIT ${limit}`;
	}

	supportsReturning = true;
}

export function createDialect(type: DatabaseType): Dialect {
	switch (type) {
		case "postgresql":
			return new PostgreSQLDialect();
		case "mysql":
			return new MySQLDialect();
		case "sqlite":
			return new SQLiteDialect();
		default:
			throw new Error(`Unsupported database type: ${type}`);
	}
}
