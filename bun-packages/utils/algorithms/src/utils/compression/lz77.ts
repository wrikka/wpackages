export interface LZ77Match {
	offset: number;
	length: number;
	char: string;
}

export interface LZ77Result {
	encoded: LZ77Match[];
	decoded: string;
}

export function lz77Encode(text: string, windowSize = 4096, lookaheadBufferSize = 15): LZ77Match[] {
	const encoded: LZ77Match[] = [];
	let i = 0;

	while (i < text.length) {
		let bestMatch = { offset: 0, length: 0 };
		const maxLookahead = Math.min(lookaheadBufferSize, text.length - i);

		for (let j = Math.max(0, i - windowSize); j < i; j++) {
			let matchLength = 0;
			while (
				matchLength < maxLookahead &&
				text[j + matchLength] === text[i + matchLength]
			) {
				matchLength++;
			}

			if (matchLength > bestMatch.length) {
				bestMatch = {
					offset: i - j,
					length: matchLength,
				};
			}
		}

		const nextChar = i + bestMatch.length < text.length ? text[i + bestMatch.length] ?? "" : "";

		encoded.push({
			offset: bestMatch.offset,
			length: bestMatch.length,
			char: nextChar,
		});

		i += bestMatch.length + 1;
	}

	return encoded;
}

export function lz77Decode(encoded: LZ77Match[]): string {
	let decoded = "";
	for (const token of encoded) {
		if (token.offset > 0 && token.length > 0) {
			const start = decoded.length - token.offset;
			for (let i = 0; i < token.length; i++) {
				decoded += decoded[start + i];
			}
		}
		if (token.char) {
			decoded += token.char;
		}
	}
	return decoded;
}

export function lz77Coding(text: string): LZ77Result {
	const encoded = lz77Encode(text);
	const decoded = lz77Decode(encoded);
	return { encoded, decoded };
}
