export function kmpSearch(text: string, pattern: string): number[] {
	if (pattern.length === 0) {
		return [];
	}

	const lps = computeLPS(pattern);
	const result: number[] = [];
	let i = 0;
	let j = 0;

	while (i < text.length) {
		if (text[i] === pattern[j]) {
			i++;
			j++;
		}

		if (j === pattern.length) {
			result.push(i - j);
			j = lps[j - 1] ?? 0;
		} else if (i < text.length && text[i] !== pattern[j]) {
			if (j !== 0) {
				j = lps[j - 1] ?? 0;
			} else {
				i++;
			}
		}
	}

	return result;
}

function computeLPS(pattern: string): number[] {
	const lps = Array.from({ length: pattern.length }, () => 0);
	let len = 0;
	let i = 1;

	while (i < pattern.length) {
		if (pattern[i] === pattern[len]) {
			len++;
			lps[i] = len;
			i++;
		} else {
			if (len !== 0) {
				len = lps[len - 1] ?? 0;
			} else {
				lps[i] = 0;
				i++;
			}
		}
	}

	return lps;
}
