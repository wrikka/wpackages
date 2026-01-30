import type { QueryOptions, QueryParams, SortField, SortOrder } from "../../types";
import { groupToFilterString } from "./odata";

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
