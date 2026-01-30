import { describe, expect, it } from "vitest";
import { vigenereCipherEncrypt, vigenereCipherDecrypt } from "./vigenere-cipher";

describe("vigenereCipher", () => {
	it("should encrypt and decrypt correctly", () => {
		const text = "Hello World!";
		const key = "KEY";
		const encrypted = vigenereCipherEncrypt(text, key);
		const decrypted = vigenereCipherDecrypt(encrypted, key);
		expect(decrypted).toBe(text);
	});

	it("should handle empty key", () => {
		const text = "Hello";
		const key = "";
		const encrypted = vigenereCipherEncrypt(text, key);
		const decrypted = vigenereCipherDecrypt(encrypted, key);
		expect(decrypted).toBe(text);
	});

	it("should preserve non-alphabetic characters", () => {
		const text = "Hello, World! 123";
		const key = "ABC";
		const encrypted = vigenereCipherEncrypt(text, key);
		const decrypted = vigenereCipherDecrypt(encrypted, key);
		expect(decrypted).toBe(text);
	});

	it("should handle empty string", () => {
		const text = "";
		const key = "KEY";
		const encrypted = vigenereCipherEncrypt(text, key);
		const decrypted = vigenereCipherDecrypt(encrypted, key);
		expect(decrypted).toBe("");
	});

	it("should handle repeated key", () => {
		const text = "ATTACKATDAWN";
		const key = "LEMON";
		const encrypted = vigenereCipherEncrypt(text, key);
		const decrypted = vigenereCipherDecrypt(encrypted, key);
		expect(decrypted).toBe(text);
	});
});
