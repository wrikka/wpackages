import type { ColumnDefinition } from "./schema";
import type { IndexInfo } from "../core/types";

export interface IndexDefinition {
	columns: string[];
	unique?: boolean;
	name?: string;
}

export class IndexBuilder<T = unknown> {
	private indexes: IndexInfo[] = [];
	private tableName: string;

	constructor(tableName: string) {
		this.tableName = tableName;
	}

	on(...columns: (keyof T)[]): this {
		const index: IndexInfo = {
			name: `idx_${this.tableName}_${Array.from(columns).join("_")}`,
			columns: columns as string[],
			unique: false,
		};
		this.indexes.push(index);
		return this;
	}

	unique(): this {
		const lastIndex = this.indexes[this.indexes.length - 1];
		if (lastIndex) {
			lastIndex.unique = true;
		}
		return this;
	}

	name(name: string): this {
		const lastIndex = this.indexes[this.indexes.length - 1];
		if (lastIndex) {
			lastIndex.name = name;
		}
		return this;
	}

	build(): IndexInfo[] {
		return this.indexes;
	}
}

export function defineIndexes<T = unknown>(tableName: string): IndexBuilder<T> {
	return new IndexBuilder<T>(tableName);
}
