import type { ColumnType } from "../core/types";

export interface ColumnDefinition {
	type: ColumnType;
	length?: number;
	nullable?: boolean;
	defaultValue?: unknown;
	primaryKey?: boolean;
	autoIncrement?: boolean;
	unique?: boolean;
	index?: boolean;
	enumValues?: string[];
}

export type ColumnSchema<T = unknown> = {
	[K in keyof T]: ColumnDefinition;
};

export interface TableDefinition<T = unknown> {
	name: string;
	schema: ColumnSchema<T>;
}

export class SchemaBuilder<T = unknown> {
	private columns: Map<string, ColumnDefinition> = new Map();
	private tableName: string;

	constructor(name: string) {
		this.tableName = name;
	}

	int(name: keyof T): this {
		this.columns.set(name as string, { type: "integer" });
		return this;
	}

	bigInt(name: keyof T): this {
		this.columns.set(name as string, { type: "bigint" });
		return this;
	}

	text(name: keyof T): this {
		this.columns.set(name as string, { type: "text" });
		return this;
	}

	varchar(name: keyof T, length: number = 255): this {
		this.columns.set(name as string, { type: "varchar", length });
		return this;
	}

	boolean(name: keyof T): this {
		this.columns.set(name as string, { type: "boolean" });
		return this;
	}

	decimal(name: keyof T): this {
		this.columns.set(name as string, { type: "decimal" });
		return this;
	}

	float(name: keyof T): this {
		this.columns.set(name as string, { type: "float" });
		return this;
	}

	date(name: keyof T): this {
		this.columns.set(name as string, { type: "date" });
		return this;
	}

	datetime(name: keyof T): this {
		this.columns.set(name as string, { type: "datetime" });
		return this;
	}

	timestamp(name: keyof T): this {
		this.columns.set(name as string, { type: "timestamp" });
		return this;
	}

	json(name: keyof T): this {
		this.columns.set(name as string, { type: "json" });
		return this;
	}

	uuid(name: keyof T): this {
		this.columns.set(name as string, { type: "uuid" });
		return this;
	}

	enum(name: keyof T, values: string[]): this {
		this.columns.set(name as string, { type: "enum", enumValues: values });
		return this;
	}

	nullable(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.nullable = true;
			}
		}
		return this;
	}

	notNull(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.nullable = false;
			}
		}
		return this;
	}

	default(value: unknown): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.defaultValue = value;
			}
		}
		return this;
	}

	primaryKey(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.primaryKey = true;
				col.nullable = false;
			}
		}
		return this;
	}

	autoIncrement(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.autoIncrement = true;
				col.primaryKey = true;
				col.nullable = false;
			}
		}
		return this;
	}

	unique(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.unique = true;
			}
		}
		return this;
	}

	index(): this {
		const lastKey = Array.from(this.columns.keys()).pop();
		if (lastKey) {
			const col = this.columns.get(lastKey);
			if (col) {
				col.index = true;
			}
		}
		return this;
	}

	build(): TableDefinition<T> {
		return {
			name: this.tableName,
			schema: Object.fromEntries(this.columns) as ColumnSchema<T>,
		};
	}
}

export function defineTable<T = unknown>(name: string): SchemaBuilder<T> {
	return new SchemaBuilder<T>(name);
}
