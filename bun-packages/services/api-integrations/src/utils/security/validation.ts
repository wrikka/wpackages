import type { EncryptedData, SecurityConfig, SignedData } from "../../types";
import { Result } from "../result";
import type { Result as ResultType } from "../result";

export const validateSecurityConfig = (
	config: SecurityConfig,
): ResultType<SecurityConfig, { type: "validation"; message: string }> => {
	if (config.encryption) {
		if (!["aes-256-gcm", "aes-256-cbc"].includes(config.encryption.algorithm)) {
			return Result.err({
				message: "Invalid encryption algorithm",
				type: "validation",
			});
		}
	}

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

export const isIpWhitelisted = (
	ip: string,
	whitelist?: readonly string[],
): boolean => {
	if (!whitelist || whitelist.length === 0) return true;
	return whitelist.includes(ip) || whitelist.includes("*");
};

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

export const validateEncryptedData = (
	data: EncryptedData,
): ResultType<boolean, { type: "validation"; message: string }> => {
	if (!data.ciphertext || !data.iv || !data.algorithm) {
		return Result.err({
			message: "Invalid encrypted data structure",
			type: "validation",
		});
	}

	const maxAge = 60 * 60 * 1000; // 1 hour
	if (Date.now() - data.timestamp > maxAge) {
		return Result.err({
			message: "Encrypted data is too old",
			type: "validation",
		});
	}

	return Result.ok(true);
};

export const validateSignedData = (
	data: SignedData,
): ResultType<boolean, { type: "validation"; message: string }> => {
	if (!data.data || !data.signature || !data.algorithm) {
		return Result.err({
			message: "Invalid signed data structure",
			type: "validation",
		});
	}

	const maxAge = 60 * 60 * 1000; // 1 hour
	if (Date.now() - data.timestamp > maxAge) {
		return Result.err({
			message: "Signed data is too old",
			type: "validation",
		});
	}

	return Result.ok(true);
};

export const verifyTimestamp = (
	timestamp: number,
	windowMs: number = 5 * 60 * 1000, // 5 minutes
): boolean => {
	const now = Date.now();
	const diff = Math.abs(now - timestamp);
	return diff <= windowMs;
};
