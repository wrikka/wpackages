import { decryptValue, encryptValue, isEncrypted, isSensitiveKey, maskValue } from "@wpackages/config-manager/utils/encryption.utils";

export type EncryptionConfig = {
	key?: string;
	salt?: string;
};

const DEFAULT_ENCRYPTION_KEY = "default-env-manager-key";
const DEFAULT_ENCRYPTION_SALT = "default-env-manager-salt";

export const getDefaultEncryptionConfig = (): EncryptionConfig => ({
	key: process.env.ENV_MANAGER_ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY,
	salt: process.env.ENV_MANAGER_ENCRYPTION_SALT || DEFAULT_ENCRYPTION_SALT,
});

export const encryptSecret = (value: string, config?: EncryptionConfig): string => {
	const fullConfig = { ...getDefaultEncryptionConfig(), ...config };
	return encryptValue(value, fullConfig);
};

export const decryptSecret = (value: string, config?: EncryptionConfig): string => {
	const fullConfig = { ...getDefaultEncryptionConfig(), ...config };
	return decryptValue(value, fullConfig);
};

export const isValueEncrypted = (value: string): boolean => {
	return isEncrypted(value);
};

export const maskSecretValue = (value: string, key: string): string => {
	if (isSensitiveKey(key)) {
		return maskValue(value);
	}
	return value;
};

export const maskAllSecrets = (env: Record<string, string>): Record<string, string> => {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(env)) {
		result[key] = maskSecretValue(value, key);
	}
	return result;
};

export const listSecretKeys = (env: Record<string, string>): string[] => {
	return Object.keys(env).filter((key) => isSensitiveKey(key));
};

export const auditSecrets = (env: Record<string, string>): {
	encrypted: string[];
	unencryptedSecrets: string[];
	sensitiveKeys: string[];
} => {
	const sensitiveKeys = listSecretKeys(env);
	const encrypted = Object.entries(env)
		.filter(([_, value]) => isValueEncrypted(value))
		.map(([key]) => key);

	const unencryptedSecrets = sensitiveKeys.filter((key) => !encrypted.includes(key));

	return {
		encrypted,
		unencryptedSecrets,
		sensitiveKeys,
	};
};
