import type { SignatureVerification } from "../types";

/**
 * Webhook utilities - Pure functions
 */

/**
 * Verify webhook signature using HMAC
 */
export const verifyWebhookSignature = async (
	payload: string,
	signature: string,
	config: SignatureVerification,
): Promise<boolean> => {
	try {
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			"raw",
			encoder.encode(config.secret),
			{ hash: getHashAlgorithm(config.algorithm), name: "HMAC" },
			false,
			["sign"],
		);

		const signatureBuffer = await crypto.subtle.sign(
			"HMAC",
			key,
			encoder.encode(payload),
		);

		const computedSignature = bufferToHex(signatureBuffer);
		const expectedSignature = signature
			.toLowerCase()
			.replace(/^sha256=|^sha1=|^md5=/, "");

		return computedSignature === expectedSignature;
	} catch {
		return false;
	}
};

/**
 * Generate webhook signature
 */
export const generateWebhookSignature = async (
	payload: string,
	secret: string,
	algorithm: "sha256" | "sha1" | "md5" = "sha256",
): Promise<string> => {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ hash: getHashAlgorithm(algorithm), name: "HMAC" },
		false,
		["sign"],
	);

	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(payload),
	);

	return `${algorithm}=${bufferToHex(signatureBuffer)}`;
};

/**
 * Get hash algorithm name for Web Crypto API
 */
const getHashAlgorithm = (algorithm: "sha256" | "sha1" | "md5"): string => {
	switch (algorithm) {
		case "sha256":
			return "SHA-256";
		case "sha1":
			return "SHA-1";
		case "md5":
			throw new Error("MD5 is not supported in Web Crypto API");
		default:
			return "SHA-256";
	}
};

/**
 * Convert ArrayBuffer to hex string
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};

/**
 * Parse webhook event ID from headers
 */
export const parseWebhookEventId = (
	headers: Record<string, string>,
	headerName = "x-webhook-id",
): string | undefined => {
	return headers[headerName.toLowerCase()];
};

/**
 * Parse webhook timestamp from headers
 */
export const parseWebhookTimestamp = (
	headers: Record<string, string>,
	headerName = "x-webhook-timestamp",
): number | undefined => {
	const timestamp = headers[headerName.toLowerCase()];
	return timestamp ? Number.parseInt(timestamp, 10) : undefined;
};
