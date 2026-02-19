import { describe, expect, it } from "vitest";
import { sha512 } from "./sha512";

describe.skip("sha512", () => {
	it("should hash a simple string correctly", () => {
		const result = sha512("hello");
		expect(result).toBe("9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043");
	});

	it("should hash an empty string", () => {
		const result = sha512("");
		expect(result).toBe("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
	});

	it("should hash Uint8Array", () => {
		const data = new Uint8Array([104, 101, 108, 108, 111]);
		const result = sha512(data);
		expect(result).toBe("9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043");
	});

	it("should produce different hashes for different inputs", () => {
		const hash1 = sha512("hello");
		const hash2 = sha512("world");
		expect(hash1).not.toBe(hash2);
	});

	it("should produce consistent hashes for same input", () => {
		const hash1 = sha512("test");
		const hash2 = sha512("test");
		expect(hash1).toBe(hash2);
	});
});
