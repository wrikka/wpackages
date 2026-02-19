import { describe, expect, it } from "vitest";
import { caesarCipherEncrypt, caesarCipherDecrypt } from "./caesar-cipher";

describe("caesarCipher", () => {
	it("should encrypt and decrypt correctly", () => {
		const text = "Hello World!";
		const shift = 3;
		const encrypted = caesarCipherEncrypt(text, shift);
		const decrypted = caesarCipherDecrypt(encrypted, shift);
		expect(decrypted).toBe(text);
	});

	it("should handle negative shifts", () => {
		const text = "Hello";
		const encrypted = caesarCipherEncrypt(text, -3);
		const decrypted = caesarCipherDecrypt(encrypted, -3);
		expect(decrypted).toBe(text);
	});

	it("should handle shifts greater than 26", () => {
		const text = "Hello";
		const encrypted = caesarCipherEncrypt(text, 29);
		const decrypted = caesarCipherDecrypt(encrypted, 29);
		expect(decrypted).toBe(text);
	});

	it("should preserve non-alphabetic characters", () => {
		const text = "Hello, World! 123";
		const shift = 5;
		const encrypted = caesarCipherEncrypt(text, shift);
		const decrypted = caesarCipherDecrypt(encrypted, shift);
		expect(decrypted).toBe(text);
	});

	it("should handle empty string", () => {
		const text = "";
		const encrypted = caesarCipherEncrypt(text, 5);
		const decrypted = caesarCipherDecrypt(encrypted, 5);
		expect(decrypted).toBe("");
	});
});
