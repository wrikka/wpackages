import type { ODataQueryOptions, QueryCondition, QueryGroup, QueryOptions } from "../../types";

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
