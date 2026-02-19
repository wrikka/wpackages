export function hmac(data: string | Uint8Array, key: string | Uint8Array, algorithm: "SHA-256" | "SHA-512" = "SHA-256"): string {
	const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
	const keyData = typeof key === "string" ? new TextEncoder().encode(key) : key;

	// @ts-ignore - Bun-specific API
	const hmacKey = crypto.subtle.importKeySync("raw", keyData, { name: "HMAC", hash: algorithm }, false, ["sign"]);
	// @ts-ignore - Bun-specific API
	const signature = crypto.subtle.signSync("HMAC", hmacKey, input);

	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
