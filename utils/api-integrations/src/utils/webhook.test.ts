import { describe, expect, it } from "vitest";
import {
	generateWebhookSignature,
	parseWebhookEventId,
	parseWebhookTimestamp,
	verifyWebhookSignature,
} from "./webhook";

describe("webhook", () => {
	const payload = "{\"event\":\"user.created\",\"data\":{\"id\":123}}";
	const secret = "webhook-secret-key";

	describe("generateWebhookSignature", () => {
		it("should generate signature", async () => {
			const signature = await generateWebhookSignature(payload, secret);
			expect(signature).toContain("sha256=");
			expect(signature.length).toBeGreaterThan(10);
		});

		it("should generate different signatures for different payloads", async () => {
			const sig1 = await generateWebhookSignature(payload, secret);
			const sig2 = await generateWebhookSignature("{\"different\":true}", secret);
			expect(sig1).not.toBe(sig2);
		});
	});

	describe("verifyWebhookSignature", () => {
		it("should verify correct signature", async () => {
			const signature = await generateWebhookSignature(payload, secret);
			const verified = await verifyWebhookSignature(payload, signature, {
				algorithm: "sha256",
				secret,
			});
			expect(verified).toBe(true);
		});

		it("should reject incorrect signature", async () => {
			const verified = await verifyWebhookSignature(
				payload,
				"sha256=invalid",
				{
					algorithm: "sha256",
					secret,
				},
			);
			expect(verified).toBe(false);
		});

		it("should reject wrong secret", async () => {
			const signature = await generateWebhookSignature(payload, secret);
			const verified = await verifyWebhookSignature(payload, signature, {
				algorithm: "sha256",
				secret: "wrong-secret",
			});
			expect(verified).toBe(false);
		});
	});

	describe("parseWebhookEventId", () => {
		it("should parse event ID from headers", () => {
			const headers = { "x-webhook-id": "evt_123456" };
			const eventId = parseWebhookEventId(headers);
			expect(eventId).toBe("evt_123456");
		});

		it("should handle missing header", () => {
			const eventId = parseWebhookEventId({});
			expect(eventId).toBeUndefined();
		});

		it("should use custom header name", () => {
			const headers = { "custom-event-id": "evt_789" };
			const eventId = parseWebhookEventId(headers, "custom-event-id");
			expect(eventId).toBe("evt_789");
		});
	});

	describe("parseWebhookTimestamp", () => {
		it("should parse timestamp from headers", () => {
			const headers = { "x-webhook-timestamp": "1234567890" };
			const timestamp = parseWebhookTimestamp(headers);
			expect(timestamp).toBe(1234567890);
		});

		it("should handle missing header", () => {
			const timestamp = parseWebhookTimestamp({});
			expect(timestamp).toBeUndefined();
		});
	});
});
