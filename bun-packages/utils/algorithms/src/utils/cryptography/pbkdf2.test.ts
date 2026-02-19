import { describe, expect, it } from "vitest";
import { pbkdf2 } from "./pbkdf2";

describe.skip("pbkdf2", () => {
	it("should derive a key with SHA-256", async () => {
		const result = await pbkdf2("password", "salt", 1000, 32);
		expect(result.length).toBe(64);
	});

	it("should derive a key with SHA-512", async () => {
		const result = await pbkdf2("password", "salt", 1000, 32, "SHA-512");
		expect(result.length).toBe(64);
	});

	it("should derive different keys for different salts", async () => {
		const key1 = await pbkdf2("password", "salt1", 1000, 32);
		const key2 = await pbkdf2("password", "salt2", 1000, 32);
		expect(key1).not.toBe(key2);
	});

	it("should derive different keys for different passwords", async () => {
		const key1 = await pbkdf2("password1", "salt", 1000, 32);
		const key2 = await pbkdf2("password2", "salt", 1000, 32);
		expect(key1).not.toBe(key2);
	});

	it("should produce consistent results for same inputs", async () => {
		const key1 = await pbkdf2("password", "salt", 1000, 32);
		const key2 = await pbkdf2("password", "salt", 1000, 32);
		expect(key1).toBe(key2);
	});
});
