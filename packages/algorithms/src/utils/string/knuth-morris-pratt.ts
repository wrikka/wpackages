// Function to compute the Longest Proper Prefix Suffix (LPS) array
const computeLPSArray = (pattern: string): number[] => {
	const m = pattern.length;
	const lps = Array.from({ length: m }, () => 0);
	let length = 0; // Length of the previous longest prefix suffix
	let i = 1;

	while (i < m) {
		const charI = pattern[i];
		const charLength = pattern[length];

		if (charI === charLength) {
			length++;
			lps[i] = length;
			i++;
		} else {
			if (length !== 0) {
				const newLength = lps[length - 1];
				if (newLength !== undefined) {
					length = newLength;
				}
			} else {
				lps[i] = 0;
				i++;
			}
		}
	}
	return lps;
};

export function knuthMorrisPratt(text: string, pattern: string): number {
	const n = text.length;
	const m = pattern.length;

	if (m === 0) return 0;
	if (n < m) return -1;

	const lps = computeLPSArray(pattern);
	let i = 0; // index for text
	let j = 0; // index for pattern

	while (i < n) {
		const textChar = text[i];
		const patternChar = pattern[j];

		if (textChar === patternChar) {
			i++;
			j++;
		} else {
			if (j !== 0) {
				const newJ = lps[j - 1];
				if (newJ !== undefined) {
					j = newJ;
				}
			} else {
				i++;
			}
		}

		if (j === m) {
			return i - j; // Found pattern at index i - j
		}
	}

	return -1;
}
