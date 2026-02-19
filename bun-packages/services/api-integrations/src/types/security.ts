import type { IntegrationError } from "./integration";

type ResultType<T, E> =
	| { success: true; value: T }
	| { success: false; error: E };

/**
 * Security configuration for integrations
 */
export type SecurityConfig = {
	readonly encryption?: EncryptionConfig;
	readonly signing?: SigningConfig;
	readonly rateLimit?: SecurityRateLimitConfig;
	readonly ipWhitelist?: readonly string[];
	readonly requireHttps?: boolean;
	readonly tokenRotation?: boolean;
};

/**
 * Encryption configuration
 */
export type EncryptionConfig = {
	readonly algorithm: "aes-256-gcm" | "aes-256-cbc";
	readonly keyDerivation?: "pbkdf2" | "scrypt";
	readonly saltLength?: number;
};

/**
 * Signing configuration
 */
export type SigningConfig = {
	readonly algorithm: "hmac-sha256" | "hmac-sha512" | "rsa-sha256";
	readonly secret?: string;
	readonly publicKey?: string;
	readonly privateKey?: string;
};

/**
 * Security rate limit configuration
 */
export type SecurityRateLimitConfig = {
	readonly maxRequests: number;
	readonly windowMs: number;
	readonly strategy: "fixed" | "sliding" | "token_bucket";
	readonly skipSuccessfulRequests?: boolean;
	readonly skipFailedRequests?: boolean;
};

/**
 * Security context
 */
export type SecurityContext = {
	readonly encrypted: boolean;
	readonly signed: boolean;
	readonly verified: boolean;
	readonly ipAddress?: string;
	readonly timestamp: number;
	readonly nonce?: string;
};

/**
 * Encrypted data
 */
export type EncryptedData = {
	readonly ciphertext: string;
	readonly iv: string;
	readonly tag?: string;
	readonly algorithm: string;
	readonly timestamp: number;
};

/**
 * Signed data
 */
export type SignedData<T = unknown> = {
	readonly data: T;
	readonly signature: string;
	readonly algorithm: string;
	readonly timestamp: number;
};

/**
 * Security validation
 */
export type SecurityValidation = {
	readonly valid: boolean;
	readonly encrypted: boolean;
	readonly signed: boolean;
	readonly verified: boolean;
	readonly errors?: readonly string[];
};

/**
 * Secure request
 */
export type SecureRequest = {
	readonly url: string;
	readonly method: string;
	readonly headers: Record<string, string>;
	readonly body?: unknown;
	readonly security: SecurityContext;
};

/**
 * Secure response
 */
export type SecureResponse<T = unknown> = {
	readonly status: number;
	readonly data: T;
	readonly security: SecurityContext;
};

/**
 * Security middleware
 */
export type SecurityMiddleware = (
	request: SecureRequest,
) => Promise<ResultType<SecureRequest, IntegrationError>>;

/**
 * Security interceptor
 */
export type SecurityInterceptor = {
	readonly request?: SecurityMiddleware;
	readonly response?: (
		response: SecureResponse,
	) => Promise<ResultType<SecureResponse, IntegrationError>>;
};
