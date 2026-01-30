export function longestCommonSubsequence(str1: string, str2: string): string {
	const m = str1.length;
	const n = str2.length;

	const dp = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

	// Build the DP table
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const char1 = str1[i - 1];
			const char2 = str2[j - 1];
			const dp_i = dp[i];
			const dp_i_minus_1 = dp[i - 1];

			if (char1 === char2 && dp_i_minus_1 !== undefined) {
				const val = dp_i_minus_1[j - 1];
				if (dp_i !== undefined && val !== undefined) {
					dp_i[j] = val + 1;
				}
			} else {
				const val1 = dp_i_minus_1?.[j];
				const val2 = dp_i?.[j - 1];
				if (dp_i !== undefined && val1 !== undefined && val2 !== undefined) {
					dp_i[j] = Math.max(val1, val2);
				}
			}
		}
	}

	// Reconstruct the LCS from the DP table
	let i = m;
	let j = n;
	let lcs = "";

	while (i > 0 && j > 0) {
		const char1 = str1[i - 1];
		const char2 = str2[j - 1];
		const dp_i = dp[i];
		const dp_i_minus_1 = dp[i - 1];

		if (char1 === char2) {
			lcs = (char1 ?? "") + lcs;
			i--;
			j--;
		} else {
			const val1 = dp_i_minus_1?.[j];
			const val2 = dp_i?.[j - 1];
			if (val1 !== undefined && val2 !== undefined && val1 > val2) {
				i--;
			} else {
				j--;
			}
		}
	}

	return lcs;
}
