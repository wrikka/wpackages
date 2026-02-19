import { describe, expect, it } from "vitest";
import { generateRSAKeys, rsaEncrypt, rsaDecrypt } from "./rsa";

describe("RSA", () => {
	it("should encrypt and decrypt correctly", () => {
		const { publicKey, privateKey } = generateRSAKeys();

		const message = 42;
		const encrypted = rsaEncrypt(message, publicKey);
		const decrypted = rsaDecrypt(encrypted, privateKey);

		expect(decrypted).toBe(message);
	});

	it("should handle different messages", () => {
		const { publicKey, privateKey } = generateRSAKeys();

		const messages = [10, 20, 30, 40, 50];

		for (const message of messages) {
			const encrypted = rsaEncrypt(message, publicKey);
			const decrypted = rsaDecrypt(encrypted, privateKey);
			expect(decrypted).toBe(message);
		}
	});
});
