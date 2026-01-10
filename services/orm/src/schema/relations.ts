import type { TableDefinition } from "./schema";
import type { RelationInfo } from "../core/types";

export interface RelationDefinition {
	type: "one-to-one" | "one-to-many" | "many-to-many";
	fromColumn: string;
	toTable: string;
	toColumn: string;
	throughTable?: string;
}

export class RelationBuilder<T = unknown> {
	private relations: Map<string, RelationDefinition> = new Map();
	private tableName: string;

	constructor(tableName: string) {
		this.tableName = tableName;
	}

	oneToOne<K>(
		name: string,
		toTable: string,
		fromColumn: keyof T,
		toColumn: string,
	): this {
		this.relations.set(name, {
			type: "one-to-one",
			fromColumn: fromColumn as string,
			toTable,
			toColumn,
		});
		return this;
	}

	oneToMany<K>(
		name: string,
		toTable: string,
		fromColumn: keyof T,
		toColumn: string,
	): this {
		this.relations.set(name, {
			type: "one-to-many",
			fromColumn: fromColumn as string,
			toTable,
			toColumn,
		});
		return this;
	}

	manyToMany<K>(
		name: string,
		toTable: string,
		fromColumn: keyof T,
		toColumn: string,
		throughTable: string,
	): this {
		this.relations.set(name, {
			type: "many-to-many",
			fromColumn: fromColumn as string,
			toTable,
			toColumn,
			throughTable,
		});
		return this;
	}

	build(): RelationInfo[] {
		return Array.from(this.relations.entries()).map(([name, def]) => ({
			name,
			...def,
			fromTable: this.tableName,
		}));
	}
}

export function defineRelations<T = unknown>(tableName: string): RelationBuilder<T> {
	return new RelationBuilder<T>(tableName);
}
