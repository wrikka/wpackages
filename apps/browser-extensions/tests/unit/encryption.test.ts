import { describe, it, expect } from "vitest";
import {
	encrypt,
	decrypt,
	encryptObject,
	decryptObject,
	hash,
	generateId,
} from "@/lib/encryption";

describe("Encryption", () => {
	it("should encrypt and decrypt text", () => {
		const original = "Hello, World!";
		const encrypted = encrypt(original);
		const decrypted = decrypt(encrypted);
		expect(decrypted).toBe(original);
	});

	it("should encrypt and decrypt objects", () => {
		const original = { name: "Test", value: 42, nested: { key: "value" } };
		const encrypted = encryptObject(original);
		const decrypted = decryptObject(encrypted);
		expect(decrypted).toEqual(original);
	});

	it("should generate consistent hash", () => {
		const text = "test text";
		const hash1 = hash(text);
		const hash2 = hash(text);
		expect(hash1).toBe(hash2);
	});

	it("should generate unique IDs", () => {
		const id1 = generateId();
		const id2 = generateId();
		expect(id1).not.toBe(id2);
	});

	it("should handle decryption errors gracefully", () => {
		const result = decryptObject("invalid encrypted data");
		expect(result).toBeNull();
	});
});
