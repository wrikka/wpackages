import type {
	ODataQueryOptions,
	QueryBuilder,
	QueryCondition,
	QueryGroup,
	QueryOperator,
	QueryOptions,
	QueryParams,
	SortField,
	SortOrder,
} from "../types";

/**
 * Query utilities - Pure functions
 */

/**
 * Create query builder
 */
export const createQueryBuilder = (): QueryBuilder => {
	let filter: QueryGroup = { conditions: [], operator: "and" };
	let sortFields: SortField[] = [];
	let limitValue: number | undefined;
	let offsetValue: number | undefined;
	let selectedFields: string[] = [];
	let expandFields: string[] = [];

	const builder: QueryBuilder = {
		and: (field: string, operator: QueryOperator, value: unknown) => {
			return builder.where(field, operator, value);
		},

		build: (): QueryOptions => {
			const options: Record<string, unknown> = {};

			if (filter.conditions.length > 0) {
				options["filter"] = filter;
			}
			if (sortFields.length > 0) {
				options["sort"] = sortFields;
			}
			if (limitValue !== undefined) {
				options["limit"] = limitValue;
			}
			if (offsetValue !== undefined) {
				options["offset"] = offsetValue;
			}
			if (selectedFields.length > 0) {
				options["fields"] = selectedFields;
			}
			if (expandFields.length > 0) {
				options["expand"] = expandFields;
			}

			return options as QueryOptions;
		},

		expand: (...relations: string[]) => {
			expandFields = [...expandFields, ...relations];
			return builder;
		},

		limit: (limit: number) => {
			limitValue = limit;
			return builder;
		},

		offset: (offset: number) => {
			offsetValue = offset;
			return builder;
		},

		or: (field: string, operator: QueryOperator, value: unknown) => {
			const condition: QueryCondition = { field, operator, value };
			const newGroup: QueryGroup = {
				conditions: [condition],
				operator: "or",
			};
			filter = { ...filter, conditions: [...filter.conditions, newGroup] };
			return builder;
		},

		select: (...fields: string[]) => {
			selectedFields = [...selectedFields, ...fields];
			return builder;
		},

		sort: (field: string, order: SortOrder = "asc") => {
			sortFields = [...sortFields, { field, order }];
			return builder;
		},

		toQueryString: (): string => {
			const params = queryOptionsToParams(builder.build());
			return buildQueryStringFromParams(params);
		},
		where: (field: string, operator: QueryOperator, value: unknown) => {
			const condition: QueryCondition = { field, operator, value };
			filter = { ...filter, conditions: [...filter.conditions, condition] };
			return builder;
		},
	};

	return builder;
};

/**
 * Convert query condition to filter string
 */
export const conditionToFilterString = (condition: QueryCondition): string => {
	const { field, operator, value } = condition;

	switch (operator) {
		case "eq":
			return `${field} eq ${formatValue(value)}`;
		case "ne":
			return `${field} ne ${formatValue(value)}`;
		case "gt":
			return `${field} gt ${formatValue(value)}`;
		case "gte":
			return `${field} ge ${formatValue(value)}`;
		case "lt":
			return `${field} lt ${formatValue(value)}`;
		case "lte":
			return `${field} le ${formatValue(value)}`;
		case "in":
			return `${field} in (${formatArrayValue(value)})`;
		case "nin":
			return `not (${field} in (${formatArrayValue(value)}))`;
		case "contains":
			return `contains(${field}, ${formatValue(value)})`;
		case "startsWith":
			return `startswith(${field}, ${formatValue(value)})`;
		case "endsWith":
			return `endswith(${field}, ${formatValue(value)})`;
		case "between":
			if (Array.isArray(value) && value.length === 2) {
				return `${field} ge ${formatValue(value[0])} and ${field} le ${formatValue(value[1])}`;
			}
			return "";
		default:
			return "";
	}
};

/**
 * Convert query group to filter string
 */
export const groupToFilterString = (group: QueryGroup): string => {
	const conditions = group.conditions.map((condition) => {
		if ("field" in condition) {
			return conditionToFilterString(condition);
		}
		return `(${groupToFilterString(condition)})`;
	});

	const operator = group.operator === "or" ? " or " : " and ";
	return conditions.join(operator);
};

/**
 * Format value for query string
 */
const formatValue = (value: unknown): string => {
	if (typeof value === "string") {
		return `'${value.replace(/'/g, "''")}'`;
	}
	if (value === null) {
		return "null";
	}
	return String(value);
};

/**
 * Format array value for query string
 */
const formatArrayValue = (value: unknown): string => {
	if (!Array.isArray(value)) {
		return formatValue(value);
	}
	return value.map(formatValue).join(", ");
};

/**
 * Convert query options to query params
 */
export const queryOptionsToParams = (options: QueryOptions): QueryParams => {
	const params: QueryParams = {};

	if (options["filter"]) {
		params["filter"] = groupToFilterString(options["filter"]);
	}
	if (options["sort"] && options["sort"].length > 0) {
		params["sort"] = options["sort"].map((s) => `${s.field}:${s.order}`).join(",");
	}
	if (options["limit"] !== undefined) {
		params["limit"] = options["limit"];
	}
	if (options["offset"] !== undefined) {
		params["offset"] = options["offset"];
	}
	if (options["fields"] && options["fields"].length > 0) {
		params["fields"] = options["fields"].join(",");
	}
	if (options["expand"] && options["expand"].length > 0) {
		params["expand"] = options["expand"].join(",");
	}

	return params;
};

/**
 * Convert query options to OData format
 */
export const queryOptionsToOData = (
	options: QueryOptions,
): ODataQueryOptions => {
	const odata: Partial<
		Record<keyof ODataQueryOptions, string | number | boolean>
	> = {};

	if (options.filter) {
		odata.$filter = groupToFilterString(options.filter);
	}
	if (options.sort && options.sort.length > 0) {
		odata.$orderby = options.sort
			.map((s) => `${s.field} ${s.order}`)
			.join(", ");
	}
	if (options.limit !== undefined) {
		odata.$top = options.limit;
	}
	if (options.offset !== undefined) {
		odata.$skip = options.offset;
	}
	if (options.fields && options.fields.length > 0) {
		odata.$select = options.fields.join(",");
	}
	if (options.expand && options.expand.length > 0) {
		odata.$expand = options.expand.join(",");
	}

	return odata as unknown as ODataQueryOptions;
};

/**
 * Build query string from params
 */
export const buildQueryStringFromParams = (params: QueryParams): string => {
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(([key, value]) => {
			if (Array.isArray(value)) {
				return value
					.map((v) => `${key}=${encodeURIComponent(String(v))}`)
					.join("&");
			}
			return `${key}=${encodeURIComponent(String(value))}`;
		})
		.join("&");
};

/**
 * Parse sort string
 */
export const parseSortString = (sort: string): readonly SortField[] => {
	return sort.split(",").map((field) => {
		const [name, order = "asc"] = field.trim().split(":");
		return {
			field: name || "",
			order: (order.toLowerCase() === "desc" ? "desc" : "asc") as SortOrder,
		};
	});
};
