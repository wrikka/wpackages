const PRIME = 101;
const BASE = 256;

// Calculates the hash of a string
const calculateHash = (str: string, length: number): number => {
	let hash = 0;
	for (let i = 0; i < length; i++) {
		const char = str.charCodeAt(i);
		if (char !== undefined) {
			hash = (hash * BASE + char) % PRIME;
		}
	}
	return hash;
};

// Recalculates the hash for the next window
const recalculateHash = (
	oldHash: number,
	oldChar: string,
	newChar: string,
	h: number,
): number => {
	const oldCharCode = oldChar.charCodeAt(0);
	const newCharCode = newChar.charCodeAt(0);
	let newHash = (oldHash - oldCharCode * h) * BASE + newCharCode;
	newHash %= PRIME;
	if (newHash < 0) {
		newHash += PRIME;
	}
	return newHash;
};

export function rabinKarp(text: string, pattern: string): number {
	const n = text.length;
	const m = pattern.length;

	if (m === 0) return 0;
	if (n < m) return -1;

	// h = Math.pow(BASE, m - 1) % PRIME
	let h = 1;
	for (let i = 0; i < m - 1; i++) {
		h = (h * BASE) % PRIME;
	}

	const patternHash = calculateHash(pattern, m);
	let textHash = calculateHash(text, m);

	for (let i = 0; i <= n - m; i++) {
		if (patternHash === textHash) {
			// Check for collision
			if (text.substring(i, i + m) === pattern) {
				return i;
			}
		}

		// Recalculate hash for the next window of text
		if (i < n - m) {
			const oldChar = text[i];
			const newChar = text[i + m];
			if (oldChar !== undefined && newChar !== undefined) {
				textHash = recalculateHash(textHash, oldChar, newChar, h);
			}
		}
	}

	return -1;
}
