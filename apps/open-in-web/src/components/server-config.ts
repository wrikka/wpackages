import { SERVER_DEFAULTS } from "../constant";

/**
 * Server configuration type
 */
export interface ServerConfig {
	port: number;
	hostname: string;
	fetch: () => Response | Promise<Response>;
}

/**
 * Creates server configuration for HTML files
 * @param filePath - Path to HTML file
 * @returns Server configuration
 */
export function createHtmlServerConfig(filePath: string): ServerConfig {
	return {
		port: SERVER_DEFAULTS.port,
		hostname: SERVER_DEFAULTS.hostname,
		fetch() {
			return new Response(Bun.file(filePath));
		},
	};
}

/**
 * Creates server configuration for content
 * @param content - HTML content to serve
 * @returns Server configuration
 */
export function createContentServerConfig(content: string): ServerConfig {
	return {
		port: SERVER_DEFAULTS.port,
		hostname: SERVER_DEFAULTS.hostname,
		fetch() {
			return new Response(content, {
				headers: { "Content-Type": "text/html" },
			});
		},
	};
}
