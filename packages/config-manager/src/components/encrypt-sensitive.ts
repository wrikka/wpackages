import type { EncryptionConfig } from "../types/env";
import { decryptValue, encryptValue, isSensitiveKey, maskValue } from "../utils/encryption.utils";

/**
 * Encrypt sensitive configuration values
 * Pure function - no side effects
 */
export const encryptSensitiveValues = <T extends Record<string, unknown>>(
	config: T,
	encryption: EncryptionConfig,
): T => {
	if (!encryption.enabled) return config;

	const encrypted = { ...config };
	for (const [key, value] of Object.entries(config)) {
		if (typeof value === "string" && isSensitiveKey(key)) {
			encrypted[key as keyof T] = encryptValue(value, encryption) as T[keyof T];
		}
	}
	return encrypted;
};

/**
 * Decrypt sensitive configuration values
 * Pure function - no side effects
 */
export const decryptSensitiveValues = <T extends Record<string, unknown>>(
	config: T,
	encryption: EncryptionConfig,
): T => {
	if (!encryption.enabled) return config;

	const decrypted = { ...config };
	const prefix = encryption.prefix || "ENC:";

	for (const [key, value] of Object.entries(config)) {
		if (typeof value === "string" && value.startsWith(prefix)) {
			try {
				decrypted[key as keyof T] = decryptValue(value, encryption) as T[keyof T];
			} catch {
				// If decryption fails, keep the encrypted value
				decrypted[key as keyof T] = value as T[keyof T];
			}
		}
	}
	return decrypted;
};

/**
 * Mask sensitive values in configuration
 * Pure function - no side effects
 */
export const maskSensitiveValues = <T extends Record<string, unknown>>(
	config: T,
): T => {
	const masked = { ...config };
	for (const [key, value] of Object.entries(config)) {
		if (typeof value === "string" && isSensitiveKey(key)) {
			masked[key as keyof T] = maskValue(value) as T[keyof T];
		}
	}
	return masked;
};

/**
 * Check if configuration has encrypted values
 * Pure function - no side effects
 */
export const hasEncryptedValues = <T extends Record<string, unknown>>(
	config: T,
	prefix = "ENC:",
): boolean => {
	for (const value of Object.values(config)) {
		if (typeof value === "string" && value.startsWith(prefix)) {
			return true;
		}
	}
	return false;
};

/**
 * Get sensitive keys from configuration
 * Pure function - no side effects
 */
export const getSensitiveKeys = <T extends Record<string, unknown>>(
	config: T,
): (keyof T)[] => {
	return Object.keys(config).filter((key) => isSensitiveKey(key)) as (keyof T)[];
};
