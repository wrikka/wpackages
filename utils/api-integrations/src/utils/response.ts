import type { PaginatedResponse, PaginationMetadata, Response } from "../types";

/**
 * Response utilities - Pure functions
 */

/**
 * Check if response is successful
 */
export const isSuccessResponse = (status: number): boolean => {
	return status >= 200 && status < 300;
};

/**
 * Check if response is client error
 */
export const isClientError = (status: number): boolean => {
	return status >= 400 && status < 500;
};

/**
 * Check if response is server error
 */
export const isServerError = (status: number): boolean => {
	return status >= 500 && status < 600;
};

/**
 * Extract data from response
 */
export const extractData = <T>(response: Response<T>): T => {
	return response.data;
};

/**
 * Transform response data
 */
export const transformResponse = <T, R>(
	response: Response<T>,
	transformer: (data: T) => R,
): Response<R> => ({
	...response,
	data: transformer(response.data),
});

/**
 * Build paginated response
 */
export const buildPaginatedResponse = <T>(
	data: readonly T[],
	pagination: PaginationMetadata,
): PaginatedResponse<T> => ({
	data,
	pagination,
});

/**
 * Build pagination metadata for offset-based
 */
export const buildOffsetPaginationMetadata = (
	total: number,
	offset: number,
	limit: number,
): PaginationMetadata => ({
	currentPage: Math.floor(offset / limit) + 1,
	hasNext: offset + limit < total,
	hasPrev: offset > 0,
	total,
	totalPages: Math.ceil(total / limit),
});

/**
 * Build pagination metadata for cursor-based
 */
export const buildCursorPaginationMetadata = (
	hasNext: boolean,
	hasPrev: boolean,
	nextCursor?: string,
	prevCursor?: string,
): PaginationMetadata => ({
	hasNext,
	hasPrev,
	...(nextCursor !== undefined && { nextCursor }),
	...(prevCursor !== undefined && { prevCursor }),
});

/**
 * Build pagination metadata for page-based
 */
export const buildPagePaginationMetadata = (
	total: number,
	page: number,
	perPage: number,
): PaginationMetadata => ({
	currentPage: page,
	hasNext: page * perPage < total,
	hasPrev: page > 1,
	total,
	totalPages: Math.ceil(total / perPage),
});

/**
 * Extract pagination from headers
 */
export const extractPaginationFromHeaders = (
	headers: Record<string, string>,
): Partial<PaginationMetadata> => {
	const metadata: Record<string, unknown> = {};

	const total = headers["x-total-count"] || headers["x-total"];
	if (total) {
		metadata["total"] = Number.parseInt(total, 10);
	}

	const nextCursor = headers["x-next-cursor"];
	if (nextCursor) {
		metadata["nextCursor"] = nextCursor;
	}

	const prevCursor = headers["x-prev-cursor"];
	if (prevCursor) {
		metadata["prevCursor"] = prevCursor;
	}

	return metadata as Partial<PaginationMetadata>;
};

/**
 * Parse Link header for pagination
 */
export const parseLinkHeader = (linkHeader: string): Record<string, string> => {
	const links: Record<string, string> = {};

	const parts = linkHeader.split(",");
	for (const part of parts) {
		const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
		if (match && match[1] && match[2]) {
			const url = match[1];
			const rel = match[2];
			links[rel] = url;
		}
	}

	return links;
};

/**
 * Extract next page URL from Link header
 */
export const extractNextPageUrl = (linkHeader?: string): string | undefined => {
	if (!linkHeader) return undefined;
	const links = parseLinkHeader(linkHeader);
	return links["next"];
};

/**
 * Extract prev page URL from Link header
 */
export const extractPrevPageUrl = (linkHeader?: string): string | undefined => {
	if (!linkHeader) return undefined;
	const links = parseLinkHeader(linkHeader);
	return links["prev"];
};

/**
 * Check if response has more pages
 */
export const hasMorePages = (pagination: PaginationMetadata): boolean => {
	return pagination.hasNext;
};

/**
 * Calculate total pages
 */
export const calculateTotalPages = (total: number, perPage: number): number => {
	return Math.ceil(total / perPage);
};

/**
 * Build response with timing
 */
export const addResponseTiming = <T>(
	response: Response<T>,
	startTime: number,
): Response<T> => ({
	...response,
	duration: Date.now() - startTime,
});

/**
 * Normalize response headers to lowercase
 */
export const normalizeResponseHeaders = (
	headers: Record<string, string>,
): Record<string, string> => {
	return Object.entries(headers).reduce(
		(acc, [key, value]) => {
			acc[key.toLowerCase()] = value;
			return acc;
		},
		{} as Record<string, string>,
	);
};
