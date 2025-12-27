/**
 * Query builder types
 */

/**
 * Query operator
 */
export type QueryOperator =
	| "eq"
	| "ne"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "in"
	| "nin"
	| "contains"
	| "startsWith"
	| "endsWith"
	| "between";

/**
 * Query condition
 */
export type QueryCondition = {
	readonly field: string;
	readonly operator: QueryOperator;
	readonly value: unknown;
};

/**
 * Logical operator
 */
export type LogicalOperator = "and" | "or" | "not";

/**
 * Query group
 */
export type QueryGroup = {
	readonly operator: LogicalOperator;
	readonly conditions: readonly (QueryCondition | QueryGroup)[];
};

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort field
 */
export type SortField = {
	readonly field: string;
	readonly order: SortOrder;
};

/**
 * Query options
 */
export type QueryOptions = {
	readonly filter?: QueryGroup;
	readonly sort?: readonly SortField[];
	readonly limit?: number;
	readonly offset?: number;
	readonly fields?: readonly string[];
	readonly expand?: readonly string[];
};

/**
 * Query builder
 */
export type QueryBuilder = {
	readonly where: (
		field: string,
		operator: QueryOperator,
		value: unknown,
	) => QueryBuilder;
	readonly and: (
		field: string,
		operator: QueryOperator,
		value: unknown,
	) => QueryBuilder;
	readonly or: (
		field: string,
		operator: QueryOperator,
		value: unknown,
	) => QueryBuilder;
	readonly sort: (field: string, order?: SortOrder) => QueryBuilder;
	readonly limit: (limit: number) => QueryBuilder;
	readonly offset: (offset: number) => QueryBuilder;
	readonly select: (...fields: string[]) => QueryBuilder;
	readonly expand: (...relations: string[]) => QueryBuilder;
	readonly build: () => QueryOptions;
	readonly toQueryString: () => string;
};

/**
 * Filter expression
 */
export type FilterExpression = {
	readonly field: string;
	readonly operator: QueryOperator;
	readonly value: unknown;
	readonly logical?: LogicalOperator;
};

/**
 * Query params
 */
export type QueryParams = Record<
	string,
	string | number | boolean | readonly (string | number | boolean)[]
>;

/**
 * OData query options
 */
export type ODataQueryOptions = {
	readonly $filter?: string;
	readonly $select?: string;
	readonly $expand?: string;
	readonly $orderby?: string;
	readonly $top?: number;
	readonly $skip?: number;
	readonly $count?: boolean;
};

/**
 * GraphQL query options
 */
export type GraphQLQueryOptions = {
	readonly query: string;
	readonly variables?: Record<string, unknown>;
	readonly operationName?: string;
};
