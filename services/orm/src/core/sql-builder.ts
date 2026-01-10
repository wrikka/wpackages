import type { ASTNode, SelectNode, InsertNode, UpdateNode, DeleteNode } from "./ast";
import type { Dialect } from "./dialect";
import { createDialect, type DatabaseType } from "./dialect";

export class SQLBuilder {
	private dialect: Dialect;

	constructor(dbType: DatabaseType) {
		this.dialect = createDialect(dbType);
	}

	build(node: ASTNode): string {
		switch (node.type) {
			case "SELECT":
				return this.buildSelect(node as SelectNode);
			case "INSERT":
				return this.buildInsert(node as InsertNode);
			case "UPDATE":
				return this.buildUpdate(node as UpdateNode);
			case "DELETE":
				return this.buildDelete(node as DeleteNode);
			default:
				throw new Error(`Unsupported AST node type: ${(node as ASTNode).type}`);
		}
	}

	private buildSelect(node: SelectNode): string {
		const parts: string[] = [];

		parts.push("SELECT");

		if (node.distinct) {
			parts.push("DISTINCT");
		}

		parts.push(node.columns.map((col) => this.buildColumn(col)).join(", "));

		parts.push("FROM");
		parts.push(this.buildTable(node.from));

		if (node.joins && node.joins.length > 0) {
			for (const join of node.joins) {
				parts.push(this.buildJoin(join));
			}
		}

		if (node.where) {
			parts.push(this.buildWhere(node.where));
		}

		if (node.groupBy && node.groupBy.length > 0) {
			parts.push(
				`GROUP BY ${node.groupBy.map((col) => this.buildColumn(col)).join(", ")}`,
			);
		}

		if (node.having) {
			parts.push(`HAVING ${this.buildCondition(node.having.condition)}`);
		}

		if (node.orderBy && node.orderBy.length > 0) {
			parts.push(
				`ORDER BY ${node.orderBy.map((ord) => this.buildOrderBy(ord)).join(", ")}`,
			);
		}

		if (node.limit) {
			parts.push(this.dialect.getLimitClause(node.limit.count, node.limit.offset));
		}

		return parts.join(" ");
	}

	private buildInsert(node: InsertNode): string {
		const parts: string[] = [];

		parts.push("INSERT INTO");
		parts.push(this.buildTable(node.into));

		parts.push(`(${node.columns.map((col) => this.dialect.escapeIdentifier(col.name)).join(", ")})`);

		parts.push("VALUES");

		const values = node.values.map((row) => {
			return `(${row.map((val) => this.dialect.escapeValue(val.value)).join(", ")})`;
		});
		parts.push(values.join(", "));

		if (node.onConflict) {
			parts.push(this.buildOnConflict(node.onConflict));
		}

		if (node.returning && node.returning.length > 0 && this.dialect.supportsReturning) {
			parts.push(`RETURNING ${node.returning.map((col) => this.buildColumn(col)).join(", ")}`);
		}

		return parts.join(" ");
	}

	private buildUpdate(node: UpdateNode): string {
		const parts: string[] = [];

		parts.push("UPDATE");
		parts.push(this.buildTable(node.table));

		parts.push("SET");

		const setClause = node.set.map((set) => {
			const col = this.buildColumn(set.column);
			const val = set.value.type === "FUNCTION" ? this.buildFunction(set.value) : this.dialect.escapeValue(set.value.value);
			return `${col} = ${val}`;
		});
		parts.push(setClause.join(", "));

		if (node.where) {
			parts.push(this.buildWhere(node.where));
		}

		if (node.returning && node.returning.length > 0 && this.dialect.supportsReturning) {
			parts.push(`RETURNING ${node.returning.map((col) => this.buildColumn(col)).join(", ")}`);
		}

		return parts.join(" ");
	}

	private buildDelete(node: DeleteNode): string {
		const parts: string[] = [];

		parts.push("DELETE FROM");
		parts.push(this.buildTable(node.from));

		if (node.where) {
			parts.push(this.buildWhere(node.where));
		}

		if (node.returning && node.returning.length > 0 && this.dialect.supportsReturning) {
			parts.push(`RETURNING ${node.returning.map((col) => this.buildColumn(col)).join(", ")}`);
		}

		return parts.join(" ");
	}

	private buildColumn(node: any): string {
		const name = this.dialect.escapeIdentifier(node.name);
		if (node.table) {
			return `${this.dialect.escapeIdentifier(node.table)}.${name}`;
		}
		if (node.alias) {
			return `${name} AS ${this.dialect.escapeIdentifier(node.alias)}`;
		}
		return name;
	}

	private buildTable(node: any): string {
		const name = this.dialect.escapeIdentifier(node.name);
		if (node.alias) {
			return `${name} AS ${this.dialect.escapeIdentifier(node.alias)}`;
		}
		return name;
	}

	private buildWhere(node: any): string {
		return `WHERE ${this.buildCondition(node.condition)}`;
	}

	private buildCondition(node: any): string {
		switch (node.type) {
			case "BINARY_OP":
				return `(${this.buildCondition(node.left)} ${node.operator} ${this.buildCondition(node.right)})`;
			case "FUNCTION":
				return this.buildFunction(node);
			case "VALUE":
				return this.dialect.escapeValue(node.value);
			case "COLUMN":
				return this.buildColumn(node);
			default:
				throw new Error(`Unsupported condition type: ${node.type}`);
		}
	}

	private buildJoin(node: any): string {
		const table = this.buildTable(node.table);
		const condition = this.buildCondition(node.on);
		return `${node.joinType} JOIN ${table} ON ${condition}`;
	}

	private buildOrderBy(node: any): string {
		return `${this.buildColumn(node.column)} ${node.direction}`;
	}

	private buildFunction(node: any): string {
		const args = node.args.map((arg: any) => this.buildCondition(arg)).join(", ");
		const func = `${node.name}(${args})`;
		if (node.alias) {
			return `${func} AS ${this.dialect.escapeIdentifier(node.alias)}`;
		}
		return func;
	}

	private buildOnConflict(node: any): string {
		const columns = node.columns.map((col: any) => this.buildColumn(col)).join(", ");
		if (node.do === "NOTHING") {
			return `ON CONFLICT (${columns}) DO NOTHING`;
		}
		if (node.do === "UPDATE" && node.updateSet) {
			const setClause = node.updateSet.map((set: any) => {
				const col = this.buildColumn(set.column);
				const val = set.value.type === "FUNCTION" ? this.buildFunction(set.value) : this.dialect.escapeValue(set.value.value);
				return `${col} = ${val}`;
			});
			return `ON CONFLICT (${columns}) DO UPDATE SET ${setClause.join(", ")}`;
		}
		return "";
	}
}

export * from "./types";
export * from "./ast";
export * from "./dialect";
