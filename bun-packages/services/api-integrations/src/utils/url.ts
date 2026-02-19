/**
 * URL utilities - Pure functions
 */

/**
 * Build URL with query parameters
 */
export const buildUrl = (
	baseUrl: string,
	path?: string,
	query?: Record<string, string | number | boolean>,
): string => {
	const url = path
		? `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
		: baseUrl;

	if (!query || Object.keys(query).length === 0) {
		return url;
	}

	const queryString = buildQueryString(query);
	return `${url}?${queryString}`;
};

/**
 * Build query string from object
 */
export const buildQueryString = (
	params: Record<string, string | number | boolean>,
): string => {
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(
			([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
		)
		.join("&");
};

/**
 * Parse query string to object
 */
export const parseQueryString = (
	queryString: string,
): Record<string, string> => {
	if (!queryString) return {};

	return queryString
		.replace(/^\?/, "")
		.split("&")
		.reduce(
			(acc, pair) => {
				const [key, value] = pair.split("=");
				if (key) {
					acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
				}
				return acc;
			},
			{} as Record<string, string>,
		);
};

/**
 * Extract path parameters from URL pattern
 * Example: extractPathParams('/users/:id/posts/:postId', { id: '123', postId: '456' })
 * Returns: '/users/123/posts/456'
 */
export const buildPathWithParams = (
	pattern: string,
	params: Record<string, string | number>,
): string => {
	return Object.entries(params).reduce(
		(path, [key, value]) => path.replace(`:${key}`, String(value)),
		pattern,
	);
};

/**
 * Join URL paths
 */
export const joinPaths = (...paths: string[]): string => {
	const filtered = paths.filter(Boolean);
	return filtered
		.map((path, index) => {
			if (index === 0) {
				return path.replace(/\/$/, "").replace(/^\//, "");
			}
			if (index === filtered.length - 1) {
				return path.replace(/^\/|\/$/g, "");
			}
			return path.replace(/^\/|\/$/g, "");
		})
		.join("/");
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};
