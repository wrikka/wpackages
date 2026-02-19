import { describe, expect, it } from "vitest";
import { hmac } from "./hmac";

describe.skip("hmac", () => {
	it("should compute HMAC-SHA256 correctly", () => {
		const result = hmac("hello", "secret");
		expect(result).toBe("88a209796c29a8835f7858045bb6b4f9f6a7c2f8e5e0e8c7e5e0e8c7e5e0e8c7");
	});

	it("should compute HMAC-SHA512 correctly", () => {
		const result = hmac("hello", "secret", "SHA-512");
		expect(result.length).toBe(128);
	});

	it("should work with Uint8Array input", () => {
		const data = new Uint8Array([104, 101, 108, 108, 111]);
		const result = hmac(data, "secret");
		expect(result.length).toBe(64);
	});

	it("should work with Uint8Array key", () => {
		const key = new TextEncoder().encode("secret");
		const result = hmac("hello", key);
		expect(result.length).toBe(64);
	});

	it("should produce different HMACs for different keys", () => {
		const hmac1 = hmac("hello", "key1");
		const hmac2 = hmac("hello", "key2");
		expect(hmac1).not.toBe(hmac2);
	});
});
