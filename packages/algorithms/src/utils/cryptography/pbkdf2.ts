export async function pbkdf2(password: string | Uint8Array, salt: string | Uint8Array, iterations: number, keyLength: number, algorithm: "SHA-256" | "SHA-512" = "SHA-256"): Promise<string> {
	const passwordData = typeof password === "string" ? new TextEncoder().encode(password) : password;
	const saltData = typeof salt === "string" ? new TextEncoder().encode(salt) : salt;

	// @ts-ignore - Bun-specific API with BufferSource
	const key = await crypto.subtle.importKey("raw", passwordData as BufferSource, { name: "PBKDF2" }, false, ["deriveBits"]);

	// @ts-ignore - Bun-specific API with BufferSource
	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: saltData as BufferSource,
			iterations,
			hash: algorithm,
		},
		key,
		keyLength * 8,
	);

	return Array.from(new Uint8Array(derivedBits))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
