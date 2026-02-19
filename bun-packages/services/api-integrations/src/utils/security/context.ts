import type { SecurityContext } from "../../types";

/**
 * Build security context
 */
export const buildSecurityContext = (
	encrypted: boolean = false,
	signed: boolean = false,
	verified: boolean = false,
	ipAddress?: string,
): SecurityContext => {
	const context: SecurityContext = {
		encrypted,
		nonce: generateNonce(),
		signed,
		timestamp: Date.now(),
		verified,
	};

	if (ipAddress) {
		return { ...context, ipAddress };
	}

	return context;
};

/**
 * Generate nonce (number used once)
 */
export const generateNonce = (): string => {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
};
