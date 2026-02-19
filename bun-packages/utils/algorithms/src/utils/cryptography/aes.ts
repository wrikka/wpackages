export async function aesEncrypt(
	data: string | Uint8Array,
	key: string | Uint8Array,
	iv: string | Uint8Array,
): Promise<{ ciphertext: string; iv: string }> {
	const inputData = typeof data === "string" ? new TextEncoder().encode(data) : data;
	const keyData = typeof key === "string" ? new TextEncoder().encode(key) : key;
	const ivData = typeof iv === "string" ? new TextEncoder().encode(iv) : iv;

	// @ts-ignore - Bun-specific API with BufferSource
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		new Uint8Array(keyData.buffer.slice(keyData.byteOffset, keyData.byteOffset + keyData.byteLength)),
		{ name: "AES-GCM" },
		false,
		["encrypt"],
	);

	// @ts-ignore - Bun-specific API with BufferSource
	const encrypted = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			// @ts-ignore - Bun-specific API with BufferSource
			iv: new Uint8Array(ivData.buffer.slice(ivData.byteOffset, ivData.byteOffset + ivData.byteLength)) as any,
		},
		cryptoKey,
		new Uint8Array(inputData.buffer.slice(inputData.byteOffset, inputData.byteOffset + inputData.byteLength)) as any,
	);

	return {
		ciphertext: Array.from(new Uint8Array(encrypted))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""),
		iv: Array.from(ivData)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""),
	};
}

export async function aesDecrypt(
	ciphertext: string,
	key: string | Uint8Array,
	iv: string | Uint8Array,
): Promise<Uint8Array> {
	const ciphertextData = new Uint8Array(ciphertext.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)));
	const keyData = typeof key === "string" ? new TextEncoder().encode(key) : key;
	const ivData = typeof iv === "string"
		? new Uint8Array(iv.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)))
		: iv;

	// @ts-ignore - Bun-specific API with BufferSource
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		new Uint8Array(keyData.buffer.slice(keyData.byteOffset, keyData.byteOffset + keyData.byteLength)),
		{ name: "AES-GCM" },
		false,
		["decrypt"],
	);

	// @ts-ignore - Bun-specific API with BufferSource
	const decrypted = await crypto.subtle.decrypt(
		{
			name: "AES-GCM",
			iv: new Uint8Array(ivData.buffer.slice(ivData.byteOffset, ivData.byteOffset + ivData.byteLength)) as any,
		},
		cryptoKey,
		new Uint8Array(ciphertextData.buffer.slice(ciphertextData.byteOffset, ciphertextData.byteOffset + ciphertextData.byteLength)) as any,
	);

	return new Uint8Array(decrypted);
}
