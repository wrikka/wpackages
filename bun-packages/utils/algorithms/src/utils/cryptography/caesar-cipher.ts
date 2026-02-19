export function caesarCipherEncrypt(text: string, shift: number): string {
	return caesarCipher(text, shift);
}

export function caesarCipherDecrypt(text: string, shift: number): string {
	return caesarCipher(text, -shift);
}

function caesarCipher(text: string, shift: number): string {
	const shiftNormalized = ((shift % 26) + 26) % 26;
	let result = "";

	for (const char of text) {
		if (char >= "a" && char <= "z") {
			const shifted = String.fromCharCode(((char.charCodeAt(0) - 97 + shiftNormalized) % 26) + 97);
			result += shifted;
		} else if (char >= "A" && char <= "Z") {
			const shifted = String.fromCharCode(((char.charCodeAt(0) - 65 + shiftNormalized) % 26) + 65);
			result += shifted;
		} else {
			result += char;
		}
	}

	return result;
}
