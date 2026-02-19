import type {
	QueryBuilder,
	QueryCondition,
	QueryGroup,
	QueryOperator,
	QueryOptions,
	SortField,
	SortOrder,
} from "../../types";
import { buildQueryStringFromParams, queryOptionsToParams } from "./params";

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
