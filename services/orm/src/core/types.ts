export type DatabaseType = "postgresql" | "mysql" | "sqlite";

export type SQLOperator =
	| "="
	| "!="
	| ">"
	| ">="
	| "<"
	| "<="
	| "LIKE"
	| "IN"
	| "NOT IN"
	| "BETWEEN"
	| "IS NULL"
	| "IS NOT NULL"
	| "AND"
	| "OR"
	| "NOT";

export type SQLOrder = "ASC" | "DESC";

export type SQLJoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

export interface ColumnInfo {
	name: string;
	type: ColumnType;
	nullable: boolean;
	defaultValue?: unknown;
	primaryKey: boolean;
	autoIncrement: boolean;
	unique?: boolean;
	index?: boolean;
}

export type ColumnType =
	| "integer"
	| "bigint"
	| "text"
	| "varchar"
	| "boolean"
	| "decimal"
	| "float"
	| "date"
	| "datetime"
	| "timestamp"
	| "json"
	| "uuid"
	| "enum";

export interface TableInfo {
	name: string;
	columns: Map<string, ColumnInfo>;
	relations: RelationInfo[];
	indexes: IndexInfo[];
}

export interface RelationInfo {
	name: string;
	type: "one-to-one" | "one-to-many" | "many-to-many";
	fromTable: string;
	fromColumn: string;
	toTable: string;
	toColumn: string;
	throughTable?: string;
}

export interface IndexInfo {
	name: string;
	columns: string[];
	unique: boolean;
}

export interface QueryOptions {
	limit?: number;
	offset?: number;
	orderBy?: OrderBy[];
}

export interface OrderBy {
	column: string;
	direction: SQLOrder;
}
