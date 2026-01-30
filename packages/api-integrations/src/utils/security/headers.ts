/**
 * Build security headers
 */
export const buildSecurityHeaders = (
	nonce?: string,
	timestamp?: number,
): Record<string, string> => {
	const headers: Record<string, string> = {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"X-XSS-Protection": "1; mode=block",
	};

	if (nonce) {
		headers["X-Request-Nonce"] = nonce;
	}

	if (timestamp) {
		headers["X-Request-Timestamp"] = timestamp.toString();
	}

	return headers;
};
