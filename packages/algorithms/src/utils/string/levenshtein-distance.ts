export function levenshteinDistance(str1: string, str2: string): number {
	const m = str1.length;
	const n = str2.length;

	// Create a matrix to store the distances
	const dp = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

	// Initialize the first row and column
	for (let i = 0; i <= m; i++) {
		const row = dp[i];
		if (row !== undefined) {
			row[0] = i;
		}
	}
	for (let j = 0; j <= n; j++) {
		const firstRow = dp[0];
		if (firstRow !== undefined) {
			firstRow[j] = j;
		}
	}

	// Fill the rest of the matrix
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const char1 = str1[i - 1];
			const char2 = str2[j - 1];
			const cost = char1 === char2 ? 0 : 1;

			const row = dp[i];
			const prevRow = dp[i - 1];
			if (row !== undefined && prevRow !== undefined) {
				const deletionCost = prevRow[j];
				const insertionCost = row[j - 1];
				const substitutionCost = prevRow[j - 1];

				if (
					deletionCost !== undefined
					&& insertionCost !== undefined
					&& substitutionCost !== undefined
				) {
					row[j] = Math.min(
						deletionCost + 1, // Deletion
						insertionCost + 1, // Insertion
						substitutionCost + cost, // Substitution
					);
				}
			}
		}
	}

	const lastRow = dp[m];
	return lastRow?.[n] ?? 0;
}
