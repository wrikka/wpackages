import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import type { EncryptionConfig } from "../types/env";

/**
 * Derive key from password using scrypt
 */
const deriveKey = (password: string): Buffer => {
	return scryptSync(password, "salt", 32);
};

/**
 * Encrypt value using AES
 */
export const encryptValue = (
	value: string,
	config: EncryptionConfig,
): string => {
	if (!config.enabled) return value;

	const prefix = config.prefix || "ENC:";
	const algorithm = config.algorithm || "aes-256-gcm";

	try {
		const key = deriveKey(config.key);
		const iv = randomBytes(16);
		const cipher = createCipheriv(algorithm, key, iv);

		let encrypted = cipher.update(value, "utf8", "hex");
		encrypted += cipher.final("hex");

		// Only get auth tag for GCM mode
		const isGCM = algorithm.includes("gcm");
		const authTag = isGCM ? (cipher as any).getAuthTag() : Buffer.alloc(0);
		const combined = iv.toString("hex") + authTag.toString("hex") + encrypted;

		return `${prefix}${combined}`;
	} catch {
		// If encryption fails, return original value
		return value;
	}
};

/**
 * Decrypt value using AES
 */
export const decryptValue = (
	value: string,
	config: EncryptionConfig,
): string => {
	if (!config.enabled) return value;

	const prefix = config.prefix || "ENC:";

	if (!value.startsWith(prefix)) {
		return value;
	}

	const encrypted = value.substring(prefix.length);
	const algorithm = config.algorithm || "aes-256-gcm";

	try {
		const key = deriveKey(config.key);
		const iv = Buffer.from(encrypted.slice(0, 32), "hex");
		const authTag = Buffer.from(encrypted.slice(32, 64), "hex");
		const encryptedData = encrypted.slice(64);

		const decipher = createDecipheriv(algorithm, key, iv);
		// Only set auth tag for GCM mode
		if (algorithm.includes("gcm")) {
			(decipher as any).setAuthTag(authTag);
		}

		let decrypted = decipher.update(encryptedData, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch {
		// If decryption fails, return original value
		return value;
	}
};

/**
 * Check if value is encrypted
 */
export const isEncrypted = (value: string, prefix = "ENC:"): boolean => value.startsWith(prefix);

/**
 * Mask sensitive value
 */
export const maskValue = (value: string): string => {
	if (typeof value !== "string") return String(value);
	if (value.length <= 4) return "*".repeat(value.length);
	return value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2);
};

/**
 * Check if key is sensitive
 */
export const isSensitiveKey = (key: string): boolean => {
	const sensitivePatterns = [
		/password/i,
		/secret/i,
		/token/i,
		/key/i,
		/api[_-]?key/i,
		/auth/i,
		/credential/i,
		/private/i,
	];

	return sensitivePatterns.some(pattern => pattern.test(key));
};
