import { describe, expect, it } from "vitest";
import {
	buildSecurityContext,
	generateNonce,
	isIpWhitelisted,
	sanitizeSensitiveData,
	validateHttps,
	verifyTimestamp,
} from "./security";

describe("security", () => {
	describe("generateNonce", () => {
		it("should generate unique nonces", () => {
			const nonce1 = generateNonce();
			const nonce2 = generateNonce();
			expect(nonce1).not.toBe(nonce2);
			expect(nonce1.length).toBeGreaterThan(0);
		});
	});

	describe("buildSecurityContext", () => {
		it("should build security context", () => {
			const context = buildSecurityContext(true, true, false);
			expect(context.encrypted).toBe(true);
			expect(context.signed).toBe(true);
			expect(context.verified).toBe(false);
			expect(context.nonce).toBeDefined();
		});

		it("should include IP address when provided", () => {
			const context = buildSecurityContext(false, false, false, "127.0.0.1");
			expect(context.ipAddress).toBe("127.0.0.1");
		});
	});

	describe("isIpWhitelisted", () => {
		it("should allow all IPs when no whitelist", () => {
			expect(isIpWhitelisted("192.168.1.1")).toBe(true);
		});

		it("should check IP in whitelist", () => {
			const whitelist = ["192.168.1.1", "10.0.0.1"];
			expect(isIpWhitelisted("192.168.1.1", whitelist)).toBe(true);
			expect(isIpWhitelisted("192.168.1.2", whitelist)).toBe(false);
		});

		it("should allow wildcard", () => {
			const whitelist = ["*"];
			expect(isIpWhitelisted("any-ip", whitelist)).toBe(true);
		});
	});

	describe("validateHttps", () => {
		it("should validate HTTPS URLs", () => {
			const result = validateHttps("https://example.com", true);
			expect(result.success).toBe(true);
		});

		it("should reject HTTP when HTTPS required", () => {
			const result = validateHttps("http://example.com", true);
			expect(result.success).toBe(false);
		});

		it("should allow HTTP when HTTPS not required", () => {
			const result = validateHttps("http://example.com", false);
			expect(result.success).toBe(true);
		});
	});

	describe("sanitizeSensitiveData", () => {
		it("should redact sensitive keys", () => {
			const data = {
				username: "john",
				password: "secret123",
				apiKey: "key123",
			};
			const sanitized = sanitizeSensitiveData(data);
			expect(sanitized["username"]).toBe("john");
			expect(sanitized["password"]).toBe("***REDACTED***");
			expect(sanitized["apiKey"]).toBe("***REDACTED***");
		});

		it("should handle nested objects", () => {
			const data = {
				user: { name: "john", token: "secret" },
			};
			const sanitized = sanitizeSensitiveData(data);
			const sanitizedUser = sanitized["user"] as { name: string; token: string };
			expect(sanitizedUser["name"]).toBe("john");
			expect(sanitizedUser["token"]).toBe("***REDACTED***");
		});
	});

	describe("verifyTimestamp", () => {
		it("should verify recent timestamps", () => {
			const now = Date.now();
			expect(verifyTimestamp(now)).toBe(true);
			expect(verifyTimestamp(now - 60000)).toBe(true); // 1 min ago
		});

		it("should reject old timestamps", () => {
			const old = Date.now() - 10 * 60 * 1000; // 10 min ago
			expect(verifyTimestamp(old, 5 * 60 * 1000)).toBe(false);
		});
	});
});
