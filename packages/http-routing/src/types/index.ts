export interface HttpRoutingEnv {
	readonly MAX_BODY_BYTES: number;
	readonly PAYLOAD_BYTES: number;
	readonly ENABLE_CORS: boolean;
	readonly CORS_ALLOWED_ORIGINS?: string;
	readonly ENABLE_RATE_LIMIT: boolean;
	readonly ENABLE_AUTH: boolean;
	readonly ENABLE_BODY_LIMIT: boolean;
	readonly ENABLE_QUERY_PARSER: boolean;
	readonly ENABLE_HTTP_LOGGER: boolean;
}
