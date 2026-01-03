/**
 * Authentication types for integrations
 */

/**
 * Base authentication config
 */
export type AuthConfig =
	| ApiKeyAuth
	| OAuth2Auth
	| BasicAuth
	| BearerAuth
	| CustomAuth;

/**
 * API Key authentication
 */
export type ApiKeyAuth = {
	readonly type: "api_key";
	readonly key: string;
	readonly location: "header" | "query";
	readonly name: string;
};

/**
 * OAuth 2.0 authentication
 */
export type OAuth2Auth = {
	readonly type: "oauth2";
	readonly clientId: string;
	readonly clientSecret: string;
	readonly accessToken?: string;
	readonly refreshToken?: string;
	readonly tokenType?: string;
	readonly expiresAt?: number;
	readonly scope?: readonly string[];
	readonly authorizationUrl?: string;
	readonly tokenUrl?: string;
	readonly redirectUri?: string;
};

/**
 * Basic authentication
 */
export type BasicAuth = {
	readonly type: "basic";
	readonly username: string;
	readonly password: string;
};

/**
 * Bearer token authentication
 */
export type BearerAuth = {
	readonly type: "bearer";
	readonly token: string;
};

/**
 * Custom authentication
 */
export type CustomAuth = {
	readonly type: "custom";
	readonly headers?: Record<string, string>;
	readonly query?: Record<string, string>;
	readonly body?: Record<string, unknown>;
};

/**
 * Authentication context
 */
export type AuthContext = {
	readonly authenticated: boolean;
	readonly expiresAt?: number;
	readonly refreshable?: boolean;
	readonly metadata?: Record<string, unknown>;
};

/**
 * Token refresh result
 */
export type TokenRefreshResult = {
	readonly accessToken: string;
	readonly refreshToken?: string;
	readonly expiresAt: number;
	readonly tokenType?: string;
};
