export function buildSuffixArray(s: string): number[] {
	const n = s.length;
	const suffixArray: number[] = Array.from({ length: n }, (_, i) => i);
	const rank = s.split("").map((c) => c.charCodeAt(0));
	const tmp: number[] = Array(n).fill(0);

	for (let k = 1; k < 2 * n; k *= 2) {
		suffixArray.sort((a, b) => {
			if (rank[a]! !== rank[b]!) return rank[a]! - rank[b]!;
			const ra = a + k < n ? rank[a + k]! : -1;
			const rb = b + k < n ? rank[b + k]! : -1;
			return ra - rb;
		});

		tmp[suffixArray[0]!] = 0;
		for (let i = 1; i < n; i++) {
			const prev = suffixArray[i - 1]!;
			const curr = suffixArray[i]!;
			tmp[curr] = tmp[prev]! + (rank[prev]! !== rank[curr]! || (prev + k < n ? rank[prev + k]! : -1) !== (curr + k < n ? rank[curr + k]! : -1) ? 1 : 0);
		}

		for (let i = 0; i < n; i++) {
			rank[i] = tmp[i]!;
		}
	}

	return suffixArray;
}
