import type { CursorPagination, OffsetPagination, PagePagination, PaginationConfig } from "../types";

/**
 * Pagination utilities - Pure functions
 */

/**
 * Build offset pagination config
 */
export const buildOffsetPagination = (
	offset: number = 0,
	limit: number = 50,
): OffsetPagination => ({
	limit,
	offset,
	type: "offset",
});

/**
 * Build cursor pagination config
 */
export const buildCursorPagination = (
	limit: number = 50,
	cursor?: string,
): CursorPagination => {
	const config: CursorPagination = {
		limit,
		type: "cursor",
	};

	if (cursor) {
		return { ...config, cursor };
	}

	return config;
};

/**
 * Build page pagination config
 */
export const buildPagePagination = (
	page: number = 1,
	perPage: number = 50,
): PagePagination => ({
	page,
	perPage,
	type: "page",
});

/**
 * Convert page to offset
 */
export const pageToOffset = (page: number, perPage: number): number => {
	return (page - 1) * perPage;
};

/**
 * Convert offset to page
 */
export const offsetToPage = (offset: number, perPage: number): number => {
	return Math.floor(offset / perPage) + 1;
};

/**
 * Get next offset pagination
 */
export const getNextOffsetPagination = (
	current: OffsetPagination,
): OffsetPagination => ({
	limit: current.limit,
	offset: current.offset + current.limit,
	type: "offset",
});

/**
 * Get previous offset pagination
 */
export const getPrevOffsetPagination = (
	current: OffsetPagination,
): OffsetPagination => ({
	limit: current.limit,
	offset: Math.max(0, current.offset - current.limit),
	type: "offset",
});

/**
 * Get next cursor pagination
 */
export const getNextCursorPagination = (
	current: CursorPagination,
	nextCursor: string,
): CursorPagination => ({
	cursor: nextCursor,
	limit: current.limit,
	type: "cursor",
});

/**
 * Get next page pagination
 */
export const getNextPagePagination = (
	current: PagePagination,
): PagePagination => ({
	page: current.page + 1,
	perPage: current.perPage,
	type: "page",
});

/**
 * Get previous page pagination
 */
export const getPrevPagePagination = (
	current: PagePagination,
): PagePagination => ({
	page: Math.max(1, current.page - 1),
	perPage: current.perPage,
	type: "page",
});

/**
 * Convert pagination to query params
 */
export const paginationToQueryParams = (
	config: PaginationConfig,
): Record<string, string | number> => {
	switch (config.type) {
		case "offset":
			return {
				limit: config.limit,
				offset: config.offset,
			};
		case "cursor": {
			const params: Record<string, string | number> = {
				limit: config.limit,
			};
			if (config.cursor) {
				params["cursor"] = config.cursor;
			}
			return params;
		}
		case "page":
			return {
				page: config.page,
				per_page: config.perPage,
			};
		default:
			return {};
	}
};

/**
 * Check if has next page
 */
export const canGoNext = (
	current: number,
	total: number,
	perPage: number,
): boolean => {
	return current * perPage < total;
};

/**
 * Check if has previous page
 */
export const canGoPrev = (current: number): boolean => {
	return current > 1;
};

/**
 * Calculate page range
 */
export const calculatePageRange = (
	page: number,
	total: number,
	perPage: number,
): { start: number; end: number } => {
	const start = (page - 1) * perPage + 1;
	const end = Math.min(page * perPage, total);
	return { end, start };
};

/**
 * Validate pagination config
 */
export const isValidPaginationConfig = (config: PaginationConfig): boolean => {
	switch (config.type) {
		case "offset":
			return config.offset >= 0 && config.limit > 0;
		case "cursor":
			return config.limit > 0;
		case "page":
			return config.page >= 1 && config.perPage > 0;
		default:
			return false;
	}
};
