export function sha256(data: string | Uint8Array): string {
	const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
	// @ts-ignore - Bun-specific API
	const hash = crypto.subtle.digestSync("SHA-256", input);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
