import type { IntegrationError } from "./integration";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/**
 * Request configuration
 */
export type RequestConfig = {
	readonly url: string;
	readonly method: HttpMethod;
	readonly headers?: Record<string, string>;
	readonly query?: Record<string, string | number | boolean>;
	readonly body?: unknown;
	readonly timeout?: number;
	readonly retry?: RetryConfig;
};

/**
 * Response type
 */
export type Response<T = unknown> = {
	readonly status: number;
	readonly statusText: string;
	readonly headers: Record<string, string>;
	readonly data: T;
	readonly url: string;
	readonly duration: number;
};

/**
 * Retry configuration
 */
export type RetryConfig = {
	readonly maxAttempts: number;
	readonly initialDelay: number;
	readonly maxDelay: number;
	readonly factor: number;
	readonly retryableStatuses?: readonly number[];
};

/**
 * Request interceptor
 */
export type RequestInterceptor = (
	config: RequestConfig,
) => Promise<ResultType<RequestConfig, IntegrationError>>;

/**
 * Response interceptor
 */
export type ResponseInterceptor = <T>(
	response: Response<T>,
) => Promise<ResultType<Response<T>, IntegrationError>>;

/**
 * Pagination config
 */
export type PaginationConfig =
	| OffsetPagination
	| CursorPagination
	| PagePagination;

export type OffsetPagination = {
	readonly type: "offset";
	readonly offset: number;
	readonly limit: number;
};

export type CursorPagination = {
	readonly type: "cursor";
	readonly cursor?: string;
	readonly limit: number;
};

export type PagePagination = {
	readonly type: "page";
	readonly page: number;
	readonly perPage: number;
};

/**
 * Paginated response
 */
export type PaginatedResponse<T> = {
	readonly data: readonly T[];
	readonly pagination: PaginationMetadata;
};

export type PaginationMetadata = {
	readonly total?: number;
	readonly hasNext: boolean;
	readonly hasPrev: boolean;
	readonly nextCursor?: string;
	readonly prevCursor?: string;
	readonly currentPage?: number;
	readonly totalPages?: number;
};
