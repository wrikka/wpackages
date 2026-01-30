export function patternMatching(text: string, pattern: string): number[] {
	const result: number[] = [];
	const n = text.length;
	const m = pattern.length;

	if (m === 0 || m > n) return result;

	for (let i = 0; i <= n - m; i++) {
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

	return result;
}
