import { describe, expect, it } from "vitest";
import { sha256 } from "./sha256";

describe.skip("sha256", () => {
	it("should hash a simple string correctly", () => {
		const result = sha256("hello");
		expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
	});

	it("should hash an empty string", () => {
		const result = sha256("");
		expect(result).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	});

	it("should hash Uint8Array", () => {
		const data = new Uint8Array([104, 101, 108, 108, 111]);
		const result = sha256(data);
		expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
	});

	it("should produce different hashes for different inputs", () => {
		const hash1 = sha256("hello");
		const hash2 = sha256("world");
		expect(hash1).not.toBe(hash2);
	});

	it("should produce consistent hashes for same input", () => {
		const hash1 = sha256("test");
		const hash2 = sha256("test");
		expect(hash1).toBe(hash2);
	});
});
