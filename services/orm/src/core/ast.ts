import type { SQLOperator, SQLOrder, SQLJoinType } from "./types";

export type ASTNode =
	| SelectNode
	| InsertNode
	| UpdateNode
	| DeleteNode
	| ColumnNode
	| TableNode
	| WhereNode
	| JoinNode
	| OrderByNode
	| LimitNode
	| ValueNode
	| FunctionNode
	| BinaryOpNode;

export interface SelectNode {
	type: "SELECT";
	columns: ColumnNode[];
	from: TableNode;
	joins?: JoinNode[];
	where?: WhereNode;
	groupBy?: ColumnNode[];
	having?: WhereNode;
	orderBy?: OrderByNode[];
	limit?: LimitNode;
	distinct?: boolean;
}

export interface InsertNode {
	type: "INSERT";
	into: TableNode;
	columns: ColumnNode[];
	values: ValueNode[][];
	onConflict?: OnConflictNode;
	returning?: ColumnNode[];
}

export interface UpdateNode {
	type: "UPDATE";
	table: TableNode;
	set: SetNode[];
	where?: WhereNode;
	returning?: ColumnNode[];
}

export interface DeleteNode {
	type: "DELETE";
	from: TableNode;
	where?: WhereNode;
	returning?: ColumnNode[];
}

export interface ColumnNode {
	type: "COLUMN";
	name: string;
	table?: string;
	alias?: string;
}

export interface TableNode {
	type: "TABLE";
	name: string;
	alias?: string;
}

export interface WhereNode {
	type: "WHERE";
	condition: ConditionNode;
}

export type ConditionNode = BinaryOpNode | FunctionNode | ValueNode;

export interface BinaryOpNode {
	type: "BINARY_OP";
	operator: SQLOperator;
	left: ConditionNode;
	right: ConditionNode;
}

export interface JoinNode {
	type: "JOIN";
	joinType: SQLJoinType;
	table: TableNode;
	on: ConditionNode;
	alias?: string;
}

export interface OrderByNode {
	type: "ORDER_BY";
	column: ColumnNode;
	direction: SQLOrder;
}

export interface LimitNode {
	type: "LIMIT";
	count: number;
	offset?: number;
}

export interface ValueNode {
	type: "VALUE";
	value: unknown;
}

export interface FunctionNode {
	type: "FUNCTION";
	name: string;
	args: ConditionNode[];
	alias?: string;
}

export interface SetNode {
	column: ColumnNode;
	value: ValueNode | FunctionNode;
}

export interface OnConflictNode {
	type: "ON_CONFLICT";
	columns: ColumnNode[];
	do?: "NOTHING" | "UPDATE";
	updateSet?: SetNode[];
}
