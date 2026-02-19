import type { EncryptedData, SignedData } from "../../types";

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
