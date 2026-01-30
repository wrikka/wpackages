import { describe, expect, it } from "vitest";
import { aesDecrypt, aesEncrypt } from "./aes";

describe.skip("aes", () => {
	it("should encrypt and decrypt a string correctly", async () => {
		const key = new Uint8Array(32).fill(1);
		const iv = new Uint8Array(12).fill(2);
		const plaintext = "Hello, World!";

		const { ciphertext, iv: returnedIv } = await aesEncrypt(plaintext, key, iv);
		const decrypted = await aesDecrypt(ciphertext, key, returnedIv);

		expect(new TextDecoder().decode(decrypted)).toBe(plaintext);
	});

	it("should encrypt and decrypt Uint8Array correctly", async () => {
		const key = new Uint8Array(32).fill(1);
		const iv = new Uint8Array(12).fill(2);
		const plaintext = new Uint8Array([72, 101, 108, 108, 111]);

		const { ciphertext, iv: returnedIv } = await aesEncrypt(plaintext, key, iv);
		const decrypted = await aesDecrypt(ciphertext, key, returnedIv);

		expect(decrypted).toEqual(plaintext);
	});

	it("should produce different ciphertexts for same plaintext with different IVs", async () => {
		const key = new Uint8Array(32).fill(1);
		const iv1 = new Uint8Array(12).fill(1);
		const iv2 = new Uint8Array(12).fill(2);
		const plaintext = "Hello, World!";

		const { ciphertext: cipher1 } = await aesEncrypt(plaintext, key, iv1);
		const { ciphertext: cipher2 } = await aesEncrypt(plaintext, key, iv2);

		expect(cipher1).not.toBe(cipher2);
	});

	it("should fail to decrypt with wrong key", async () => {
		const key = new Uint8Array(32).fill(1);
		const wrongKey = new Uint8Array(32).fill(2);
		const iv = new Uint8Array(12).fill(2);
		const plaintext = "Hello, World!";

		const { ciphertext, iv: returnedIv } = await aesEncrypt(plaintext, key, iv);

		await expect(aesDecrypt(ciphertext, wrongKey, returnedIv)).rejects.toThrow("OperationError");
	});
});
