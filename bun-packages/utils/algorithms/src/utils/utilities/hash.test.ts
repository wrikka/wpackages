import { describe, expect, it } from "vitest";
import { simpleHash, djb2Hash, sdbmHash, fnv1aHash, murmurHash3 } from "./hash";

describe("simpleHash", () => {
	it("should return consistent hash for same string", () => {
		const str = "hello";
		const hash1 = simpleHash(str);
		const hash2 = simpleHash(str);
		expect(hash1).toBe(hash2);
	});

	it("should return different hash for different strings", () => {
		const hash1 = simpleHash("hello");
		const hash2 = simpleHash("world");
		expect(hash1).not.toBe(hash2);
	});
});

describe("djb2Hash", () => {
	it("should return consistent hash for same string", () => {
		const str = "hello";
		const hash1 = djb2Hash(str);
		const hash2 = djb2Hash(str);
		expect(hash1).toBe(hash2);
	});

	it("should return non-negative hash", () => {
		const hash = djb2Hash("hello");
		expect(hash).toBeGreaterThanOrEqual(0);
	});
});

describe("sdbmHash", () => {
	it("should return consistent hash for same string", () => {
		const str = "hello";
		const hash1 = sdbmHash(str);
		const hash2 = sdbmHash(str);
		expect(hash1).toBe(hash2);
	});
});

describe("fnv1aHash", () => {
	it("should return consistent hash for same string", () => {
		const str = "hello";
		const hash1 = fnv1aHash(str);
		const hash2 = fnv1aHash(str);
		expect(hash1).toBe(hash2);
	});

	it("should return non-negative hash", () => {
		const hash = fnv1aHash("hello");
		expect(hash).toBeGreaterThanOrEqual(0);
	});
});

describe("murmurHash3", () => {
	it("should return consistent hash for same string", () => {
		const str = "hello";
		const hash1 = murmurHash3(str);
		const hash2 = murmurHash3(str);
		expect(hash1).toBe(hash2);
	});

	it("should return different hash with different seed", () => {
		const str = "hello";
		const hash1 = murmurHash3(str, 0);
		const hash2 = murmurHash3(str, 123);
		expect(hash1).not.toBe(hash2);
	});

	it("should return non-negative hash", () => {
		const hash = murmurHash3("hello");
		expect(hash).toBeGreaterThanOrEqual(0);
	});
});
