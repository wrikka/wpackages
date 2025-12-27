import { DEFAULT_PAGINATION, DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG, DEFAULT_TIMEOUT } from "../constant";
import type { CursorPagination, PaginationConfig, RateLimitConfig, RetryConfig } from "../types";

/**
 * Base integration configuration
 */
export type BaseIntegrationConfig = {
	readonly baseUrl: string;
	readonly timeout?: number;
	readonly retry?: Partial<RetryConfig>;
	readonly rateLimit?: Partial<RateLimitConfig>;
	readonly headers?: Record<string, string>;
	readonly userAgent?: string;
	readonly debug?: boolean;
};

/**
 * Build complete integration config with defaults
 */
export const buildIntegrationConfig = (
	config: BaseIntegrationConfig,
): Required<BaseIntegrationConfig> => ({
	baseUrl: config.baseUrl,
	debug: config.debug ?? false,
	headers: config.headers ?? {},
	rateLimit: { ...DEFAULT_RATE_LIMIT, ...config.rateLimit } as RateLimitConfig,
	retry: { ...DEFAULT_RETRY_CONFIG, ...config.retry },
	timeout: config.timeout ?? DEFAULT_TIMEOUT,
	userAgent: config.userAgent ?? "integration-core",
});

/**
 * Pagination config builder
 */
export const buildPaginationConfig = (
	type: "offset" | "cursor" | "page",
	options: {
		offset?: number;
		cursor?: string;
		page?: number;
		limit?: number;
		perPage?: number;
	} = {},
): PaginationConfig => {
	switch (type) {
		case "offset":
			return {
				limit: options.limit ?? DEFAULT_PAGINATION.limit,
				offset: options.offset ?? 0,
				type: "offset",
			};

		case "cursor": {
			const config: CursorPagination = {
				limit: options.limit ?? DEFAULT_PAGINATION.limit,
				type: "cursor",
			};
			if (options.cursor) {
				return { ...config, cursor: options.cursor };
			}
			return config;
		}

		case "page":
			return {
				page: options.page ?? 1,
				perPage: options.perPage ?? DEFAULT_PAGINATION.limit,
				type: "page",
			};

		default:
			throw new Error(`Unknown pagination type: ${type}`);
	}
};
