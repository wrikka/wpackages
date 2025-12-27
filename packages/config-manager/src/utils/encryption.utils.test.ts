import { describe, expect, it } from "vitest";
import type { EncryptionConfig } from "../types/env";
import { decryptValue, encryptValue, isEncrypted } from "./encryption.utils";

describe("encryption.utils", () => {
	const mockConfig: EncryptionConfig = {
		enabled: true,
		key: "test-encryption-key-32-characters",
		algorithm: "aes-256-gcm",
		prefix: "ENC:",
	};

	describe("isEncrypted", () => {
		it("should detect encrypted values", () => {
			expect(isEncrypted("ENC:abc123")).toBe(true);
			expect(isEncrypted("plain text")).toBe(false);
		});

		it("should use custom prefix", () => {
			expect(isEncrypted("SECRET:abc", "SECRET:")).toBe(true);
			expect(isEncrypted("ENC:abc", "SECRET:")).toBe(false);
		});
	});

	describe("encryptValue and decryptValue", () => {
		it("should return original value when encryption disabled", () => {
			const disabledConfig: EncryptionConfig = {
				...mockConfig,
				enabled: false,
			};
			const value = "secret123";
			const encrypted = encryptValue(value, disabledConfig);
			expect(encrypted).toBe(value);

			const decrypted = decryptValue(encrypted, disabledConfig);
			expect(decrypted).toBe(value);
		});

		it("should add prefix to encrypted value", () => {
			const value = "secret123";
			const encrypted = encryptValue(value, mockConfig);
			expect(encrypted.startsWith("ENC:")).toBe(true);
		});

		it("should not decrypt non-encrypted values", () => {
			const value = "plain text";
			const result = decryptValue(value, mockConfig);
			expect(result).toBe(value);
		});

		it("should handle empty strings", () => {
			const value = "";
			const encrypted = encryptValue(value, mockConfig);
			expect(encrypted).toBeDefined();
		});
	});
});
