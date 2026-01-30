export function vigenereCipherEncrypt(text: string, key: string): string {
	return vigenereCipher(text, key, true);
}

export function vigenereCipherDecrypt(text: string, key: string): string {
	return vigenereCipher(text, key, false);
}

function vigenereCipher(text: string, key: string, encrypt: boolean): string {
	if (key.length === 0) {
		return text;
	}

	const keyUpper = key.toUpperCase();
	let result = "";
	let keyIndex = 0;

	for (const char of text) {
		if (char >= "a" && char <= "z") {
			const shift = keyUpper.charCodeAt(keyIndex % key.length) - 65;
			const shifted = encrypt
				? String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97)
				: String.fromCharCode(((char.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
			result += shifted;
			keyIndex++;
		} else if (char >= "A" && char <= "Z") {
			const shift = keyUpper.charCodeAt(keyIndex % key.length) - 65;
			const shifted = encrypt
				? String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65)
				: String.fromCharCode(((char.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
			result += shifted;
			keyIndex++;
		} else {
			result += char;
		}
	}

	return result;
}
