import type { EncryptionConfig } from "../types/env";
import { decryptValue, encryptValue, isEncrypted } from "./encryption.utils";

// Encryption configuration
const encryptionConfig: EncryptionConfig = {
	enabled: true,
	key: "your-32-character-encryption-key-here",
	algorithm: "aes-256-gcm",
	prefix: "ENC:",
};

// Example 1: Encrypt sensitive values
console.log("Encrypt Values:");
const apiKey = "my-secret-api-key-123";
const encrypted = encryptValue(apiKey, encryptionConfig);
console.log("Original:", apiKey);
console.log("Encrypted:", encrypted);

// Example 2: Decrypt values
console.log("\nDecrypt Values:");
const decrypted = decryptValue(encrypted, encryptionConfig);
console.log("Decrypted:", decrypted);

// Example 3: Check if value is encrypted
console.log("\nCheck Encryption:");
console.log(`Is "${encrypted}" encrypted?`, isEncrypted(encrypted));
console.log(`Is "${apiKey}" encrypted?`, isEncrypted(apiKey));

// Example 4: Handle non-encrypted values
console.log("\nHandle Non-encrypted:");
const plainText = "not encrypted";
const result = decryptValue(plainText, encryptionConfig);
console.log("Plain text passed through:", result === plainText);

// Example 5: Disabled encryption
console.log("\nDisabled Encryption:");
const disabledConfig: EncryptionConfig = {
	...encryptionConfig,
	enabled: false,
};
const notEncrypted = encryptValue("secret", disabledConfig);
console.log("Value when disabled:", notEncrypted);

// Example 6: Real-world usage
console.log("\nReal-world Example:");
const sensitiveEnv = {
	DATABASE_PASSWORD: "super-secret-password",
	API_SECRET: "api-secret-key",
	JWT_SECRET: "jwt-signing-key",
};

const encryptedEnv = Object.entries(sensitiveEnv).reduce(
	(acc, [key, value]) => {
		acc[key] = encryptValue(value, encryptionConfig);
		return acc;
	},
	{} as Record<string, string>,
);

console.log("Encrypted environment variables:");
console.log(encryptedEnv);
