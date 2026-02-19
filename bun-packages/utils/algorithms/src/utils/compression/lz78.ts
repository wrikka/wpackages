export interface LZ78Token {
	index: number;
	char: string;
}

export interface LZ78Result {
	encoded: LZ78Token[];
	decoded: string;
}

export function lz78Encode(text: string): LZ78Token[] {
	const dictionary: string[] = [];
	const encoded: LZ78Token[] = [];
	let current = "";

	for (const char of text) {
		const combined = current + char;
		const index = dictionary.indexOf(combined);

		if (index !== -1) {
			current = combined;
		} else {
			const dictIndex = current.length > 0 ? dictionary.indexOf(current) + 1 : 0;
			encoded.push({ index: dictIndex, char });
			dictionary.push(combined);
			current = "";
		}
	}

	if (current.length > 0) {
		const dictIndex = dictionary.indexOf(current) + 1;
		encoded.push({ index: dictIndex, char: "" });
	}

	return encoded;
}

export function lz78Decode(encoded: LZ78Token[]): string {
	const dictionary: string[] = [];
	let decoded = "";

	for (const token of encoded) {
		let entry = token.char;

		if (token.index > 0) {
			entry = dictionary[token.index - 1] + token.char;
		}

		dictionary.push(entry);
		decoded += entry;
	}

	return decoded;
}

export function lz78Coding(text: string): LZ78Result {
	const encoded = lz78Encode(text);
	const decoded = lz78Decode(encoded);
	return { encoded, decoded };
}
