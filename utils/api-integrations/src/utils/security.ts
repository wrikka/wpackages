import type { EncryptedData, SecurityConfig, SecurityContext, SignedData } from "../types";
import { Result } from "./result";
import type { Result as ResultType } from "./result";

/**
 * Security utilities - Pure functions
 */

/**
 * Build security context
 */
export const buildSecurityContext = (
	encrypted: boolean = false,
	signed: boolean = false,
	verified: boolean = false,
	ipAddress?: string,
): SecurityContext => {
	const context: SecurityContext = {
		encrypted,
		nonce: generateNonce(),
		signed,
		timestamp: Date.now(),
		verified,
	};

	if (ipAddress) {
		return { ...context, ipAddress };
	}

	return context;
};

/**
 * Generate nonce (number used once)
 */
export const generateNonce = (): string => {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
};

/**
 * Validate security config
 */
export const validateSecurityConfig = (
	config: SecurityConfig,
): ResultType<SecurityConfig, { type: "validation"; message: string }> => {
	// Validate encryption config
	if (config.encryption) {
		if (!["aes-256-gcm", "aes-256-cbc"].includes(config.encryption.algorithm)) {
			return Result.err({
				message: "Invalid encryption algorithm",
				type: "validation",
			});
		}
	}

	// Validate signing config
	if (config.signing) {
		if (
			!["hmac-sha256", "hmac-sha512", "rsa-sha256"].includes(
				config.signing.algorithm,
			)
		) {
			return Result.err({
				message: "Invalid signing algorithm",
				type: "validation",
			});
		}

		if (config.signing.algorithm.startsWith("hmac") && !config.signing.secret) {
			return Result.err({
				message: "HMAC signing requires a secret",
				type: "validation",
			});
		}

		if (
			config.signing.algorithm.startsWith("rsa")
			&& (!config.signing.publicKey || !config.signing.privateKey)
		) {
			return Result.err({
				message: "RSA signing requires public and private keys",
				type: "validation",
			});
		}
	}

	// Validate rate limit config
	if (config.rateLimit) {
		if (config.rateLimit.maxRequests <= 0) {
			return Result.err({
				message: "maxRequests must be greater than 0",
				type: "validation",
			});
		}

		if (config.rateLimit.windowMs <= 0) {
			return Result.err({
				message: "windowMs must be greater than 0",
				type: "validation",
			});
		}
	}

	return Result.ok(config);
};

/**
 * Check if IP is whitelisted
 */
export const isIpWhitelisted = (
	ip: string,
	whitelist?: readonly string[],
): boolean => {
	if (!whitelist || whitelist.length === 0) return true;
	return whitelist.includes(ip) || whitelist.includes("*");
};

/**
 * Validate HTTPS requirement
 */
export const validateHttps = (
	url: string,
	requireHttps: boolean = true,
): ResultType<boolean, { type: "security"; message: string }> => {
	if (!requireHttps) return Result.ok(true);

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") {
			return Result.err({
				message: "HTTPS is required",
				type: "security",
			});
		}
		return Result.ok(true);
	} catch {
		return Result.err({
			message: "Invalid URL",
			type: "security",
		});
	}
};

/**
 * Sanitize sensitive data for logging
 */
export const sanitizeSensitiveData = (
	data: Record<string, unknown>,
	sensitiveKeys: readonly string[] = [
		"password",
		"token",
		"secret",
		"apiKey",
		"api_key",
		"authorization",
		"clientSecret",
		"client_secret",
		"privateKey",
		"private_key",
	],
): Record<string, unknown> => {
	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		const keyLower = key.toLowerCase();
		const isSensitive = sensitiveKeys.some((sensitive) => keyLower.includes(sensitive.toLowerCase()));

		if (isSensitive) {
			sanitized[key] = "***REDACTED***";
		} else if (value && typeof value === "object" && !Array.isArray(value)) {
			sanitized[key] = sanitizeSensitiveData(
				value as Record<string, unknown>,
				sensitiveKeys,
			);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
};

/**
 * Build encrypted data structure
 */
export const buildEncryptedData = (
	ciphertext: string,
	iv: string,
	algorithm: string,
	tag?: string,
): EncryptedData => {
	const data: EncryptedData = {
		algorithm,
		ciphertext,
		iv,
		timestamp: Date.now(),
	};

	if (tag) {
		return { ...data, tag };
	}

	return data;
};

/**
 * Build signed data structure
 */
export const buildSignedData = <T>(
	data: T,
	signature: string,
	algorithm: string,
): SignedData<T> => ({
	algorithm,
	data,
	signature,
	timestamp: Date.now(),
});

/**
 * Validate encrypted data structure
 */
export const validateEncryptedData = (
	data: EncryptedData,
): ResultType<boolean, { type: "validation"; message: string }> => {
	if (!data.ciphertext || !data.iv || !data.algorithm) {
		return Result.err({
			message: "Invalid encrypted data structure",
			type: "validation",
		});
	}

	// Check if timestamp is not too old (e.g., 1 hour)
	const maxAge = 60 * 60 * 1000; // 1 hour
	if (Date.now() - data.timestamp > maxAge) {
		return Result.err({
			message: "Encrypted data is too old",
			type: "validation",
		});
	}

	return Result.ok(true);
};

/**
 * Validate signed data structure
 */
export const validateSignedData = (
	data: SignedData,
): ResultType<boolean, { type: "validation"; message: string }> => {
	if (!data.data || !data.signature || !data.algorithm) {
		return Result.err({
			message: "Invalid signed data structure",
			type: "validation",
		});
	}

	// Check if timestamp is not too old (e.g., 1 hour)
	const maxAge = 60 * 60 * 1000; // 1 hour
	if (Date.now() - data.timestamp > maxAge) {
		return Result.err({
			message: "Signed data is too old",
			type: "validation",
		});
	}

	return Result.ok(true);
};

/**
 * Build security headers
 */
export const buildSecurityHeaders = (
	nonce?: string,
	timestamp?: number,
): Record<string, string> => {
	const headers: Record<string, string> = {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
	};

	if (nonce) {
		headers["X-Request-Nonce"] = nonce;
	}

	if (timestamp) {
		headers["X-Request-Timestamp"] = timestamp.toString();
	}

	return headers;
};

/**
 * Verify timestamp is within acceptable window
 */
export const verifyTimestamp = (
	timestamp: number,
	windowMs: number = 5 * 60 * 1000, // 5 minutes
): boolean => {
	const now = Date.now();
	const diff = Math.abs(now - timestamp);
	return diff <= windowMs;
};
