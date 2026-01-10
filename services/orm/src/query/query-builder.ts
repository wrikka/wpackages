import type { SelectNode, InsertNode, UpdateNode, DeleteNode, ColumnNode, TableNode, ValueNode, WhereNode, JoinNode, OrderByNode, LimitNode, SetNode } from "../core/ast";
import type { SQLOperator, SQLOrder, SQLJoinType } from "../core/types";

export class QueryBuilder<T = unknown> {
	private selectNode: Partial<SelectNode> = {
		type: "SELECT",
		columns: [],
	};

	constructor(private tableName: string) {
		this.selectNode.from = { type: "TABLE", name: tableName };
	}

	select(...columns: (keyof T | string)[]): this {
		this.selectNode.columns = columns.map((col) => ({
			type: "COLUMN",
			name: col as string,
		}));
		return this;
	}

	where(condition: ConditionBuilder): this {
		this.selectNode.where = { type: "WHERE", condition: condition.build() };
		return this;
	}

	join(table: string, on: ConditionBuilder, type: SQLJoinType = "INNER"): this {
		if (!this.selectNode.joins) {
			this.selectNode.joins = [];
		}
		this.selectNode.joins.push({
			type: "JOIN",
			joinType: type,
			table: { type: "TABLE", name: table },
			on: on.build(),
		});
		return this;
	}

	leftJoin(table: string, on: ConditionBuilder): this {
		return this.join(table, on, "LEFT");
	}

	rightJoin(table: string, on: ConditionBuilder): this {
		return this.join(table, on, "RIGHT");
	}

	orderBy(column: keyof T, direction: SQLOrder = "ASC"): this {
		if (!this.selectNode.orderBy) {
			this.selectNode.orderBy = [];
		}
		this.selectNode.orderBy.push({
			type: "ORDER_BY",
			column: { type: "COLUMN", name: column as string },
			direction,
		});
		return this;
	}

	limit(count: number): this {
		this.selectNode.limit = { type: "LIMIT", count };
		return this;
	}

	offset(count: number): this {
		if (this.selectNode.limit) {
			this.selectNode.limit.offset = count;
		} else {
			this.selectNode.limit = { type: "LIMIT", count: 0, offset: count };
		}
		return this;
	}

	distinct(): this {
		this.selectNode.distinct = true;
		return this;
	}

	build(): SelectNode {
		if (!this.selectNode.columns || this.selectNode.columns.length === 0) {
			this.selectNode.columns = [{ type: "COLUMN", name: "*" }];
		}
		return this.selectNode as SelectNode;
	}
}

export class InsertBuilder<T = unknown> {
	private insertNode: Partial<InsertNode> = {
		type: "INSERT",
		columns: [],
		values: [],
	};

	constructor(private tableName: string) {
		this.insertNode.into = { type: "TABLE", name: tableName };
	}

	values(data: Partial<T> | Partial<T>[]): this {
		const dataArray = Array.isArray(data) ? data : [data];
		const columns = Object.keys(dataArray[0]) as (keyof T)[];

		this.insertNode.columns = columns.map((col) => ({
			type: "COLUMN",
			name: col as string,
		}));

		this.insertNode.values = dataArray.map((row) =>
			columns.map((col) => ({
				type: "VALUE",
				value: row[col],
			})),
		);

		return this;
	}

	onConflictDoNothing(): this {
		this.insertNode.onConflict = {
			type: "ON_CONFLICT",
			columns: this.insertNode.columns || [],
			do: "NOTHING",
		};
		return this;
	}

	onConflictDoUpdate(data: Partial<T>): this {
		const columns = Object.keys(data) as (keyof T)[];
		this.insertNode.onConflict = {
			type: "ON_CONFLICT",
			columns: this.insertNode.columns || [],
			do: "UPDATE",
			updateSet: columns.map((col) => ({
				column: { type: "COLUMN", name: col as string },
				value: { type: "VALUE", value: data[col] },
			})),
		};
		return this;
	}

	returning(...columns: (keyof T)[]): this {
		this.insertNode.returning = columns.map((col) => ({
			type: "COLUMN",
			name: col as string,
		}));
		return this;
	}

	build(): InsertNode {
		return this.insertNode as InsertNode;
	}
}

export class UpdateBuilder<T = unknown> {
	private updateNode: Partial<UpdateNode> = {
		type: "UPDATE",
		set: [],
	};

	constructor(private tableName: string) {
		this.updateNode.table = { type: "TABLE", name: tableName };
	}

	set(data: Partial<T>): this {
		const columns = Object.keys(data) as (keyof T)[];
		this.updateNode.set = columns.map((col) => ({
			column: { type: "COLUMN", name: col as string },
			value: { type: "VALUE", value: data[col] },
		}));
		return this;
	}

	where(condition: ConditionBuilder): this {
		this.updateNode.where = { type: "WHERE", condition: condition.build() };
		return this;
	}

	returning(...columns: (keyof T)[]): this {
		this.updateNode.returning = columns.map((col) => ({
			type: "COLUMN",
			name: col as string,
		}));
		return this;
	}

	build(): UpdateNode {
		return this.updateNode as UpdateNode;
	}
}

export class DeleteBuilder<T = unknown> {
	private deleteNode: Partial<DeleteNode> = {
		type: "DELETE",
	};

	constructor(private tableName: string) {
		this.deleteNode.from = { type: "TABLE", name: tableName };
	}

	where(condition: ConditionBuilder): this {
		this.deleteNode.where = { type: "WHERE", condition: condition.build() };
		return this;
	}

	returning(...columns: (keyof T)[]): this {
		this.deleteNode.returning = columns.map((col) => ({
			type: "COLUMN",
			name: col as string,
		}));
		return this;
	}

	build(): DeleteNode {
		return this.deleteNode as DeleteNode;
	}
}

export class ConditionBuilder {
	private conditions: any[] = [];

	column(name: string): ColumnConditionBuilder {
		return new ColumnConditionBuilder(name, this);
	}

	and(condition: ConditionBuilder): this {
		this.conditions.push({ type: "BINARY_OP", operator: "AND", left: this.build(), right: condition.build() });
		return this;
	}

	or(condition: ConditionBuilder): this {
		this.conditions.push({ type: "BINARY_OP", operator: "OR", left: this.build(), right: condition.build() });
		return this;
	}

	build(): any {
		if (this.conditions.length === 0) {
			return { type: "VALUE", value: true };
		}
		return this.conditions[0];
	}
}

export class ColumnConditionBuilder {
	constructor(private column: string, private parent: ConditionBuilder) {}

	eq(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "=",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	ne(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "!=",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	gt(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: ">",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	gte(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: ">=",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	lt(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "<",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	lte(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "<=",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	like(value: unknown): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "LIKE",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value },
		});
		return this.parent;
	}

	in(values: unknown[]): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "IN",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value: values },
		});
		return this.parent;
	}

	isNull(): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "IS NULL",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value: null },
		});
		return this.parent;
	}

	isNotNull(): ConditionBuilder {
		this.parent.conditions.push({
			type: "BINARY_OP",
			operator: "IS NOT NULL",
			left: { type: "COLUMN", name: this.column },
			right: { type: "VALUE", value: null },
		});
		return this.parent;
	}
}

export function createQueryBuilder<T = unknown>(tableName: string): QueryBuilder<T> {
	return new QueryBuilder<T>(tableName);
}

export function createInsertBuilder<T = unknown>(tableName: string): InsertBuilder<T> {
	return new InsertBuilder<T>(tableName);
}

export function createUpdateBuilder<T = unknown>(tableName: string): UpdateBuilder<T> {
	return new UpdateBuilder<T>(tableName);
}

export function createDeleteBuilder<T = unknown>(tableName: string): DeleteBuilder<T> {
	return new DeleteBuilder<T>(tableName);
}

export function createConditionBuilder(): ConditionBuilder {
	return new ConditionBuilder();
}
