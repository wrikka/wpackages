export function rollingHashSearch(text: string, pattern: string): number[] {
	const n = text.length;
	const m = pattern.length;
	const result: number[] = [];

	if (m > n || m === 0) return result;

	const base = 256;
	const mod = 101;

	let patternHash = 0;
	let textHash = 0;
	let h = 1;

	for (let i = 0; i < m - 1; i++) {
		h = (h * base) % mod;
	}

	for (let i = 0; i < m; i++) {
		patternHash = (patternHash * base + pattern.charCodeAt(i)) % mod;
		textHash = (textHash * base + text.charCodeAt(i)) % mod;
	}

	for (let i = 0; i <= n - m; i++) {
		if (patternHash === textHash) {
			let match = true;
			for (let j = 0; j < m; j++) {
				if (text[i + j] !== pattern[j]) {
					match = false;
					break;
				}
			}
			if (match) {
				result.push(i);
			}
		}

		if (i < n - m) {
			textHash = ((textHash - text.charCodeAt(i) * h) * base + text.charCodeAt(i + m)) % mod;
			if (textHash < 0) textHash += mod;
		}
	}

	return result;
}
