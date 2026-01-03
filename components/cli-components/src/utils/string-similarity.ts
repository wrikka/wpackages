/**
 * String Similarity Utils - Pure Functions
 * Calculate string similarity for command suggestions
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
	const len1 = str1.length;
	const len2 = str2.length;

	const matrix: number[][] = Array(len1 + 1)
		.fill(null)
		.map(() => Array(len2 + 1).fill(0));

	for (let i = 0; i <= len1; i++) {
		matrix[i]![0] = i;
	}

	for (let j = 0; j <= len2; j++) {
		matrix[0]![j] = j;
	}

	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[i]![j] = Math.min(
				matrix[i - 1]![j]! + 1,
				matrix[i]![j - 1]! + 1,
				matrix[i - 1]![j - 1]! + cost,
			);
		}
	}

	return matrix[len1]![len2]!;
};

/**
 * Calculate similarity score (0-1) between two strings
 */
export const similarityScore = (str1: string, str2: string): number => {
	const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
	const maxLength = Math.max(str1.length, str2.length);

	return maxLength === 0 ? 1 : 1 - distance / maxLength;
};

/**
 * Find most similar string from array
 */
export const findMostSimilar = (
	target: string,
	candidates: readonly string[],
	threshold = 0.6,
): string | undefined => {
	let bestMatch: string | undefined;
	let bestScore = 0;

	for (const candidate of candidates) {
		const score = similarityScore(target, candidate);
		if (score > bestScore && score >= threshold) {
			bestScore = score;
			bestMatch = candidate;
		}
	}

	return bestMatch;
};

/**
 * Get top N similar strings
 */
export const findSimilar = (
	target: string,
	candidates: readonly string[],
	maxResults = 3,
	threshold = 0.5,
): readonly string[] => {
	const scored = candidates
		.map((candidate) => ({
			score: similarityScore(target, candidate),
			value: candidate,
		}))
		.filter((item) => item.score >= threshold)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults);

	return scored.map((item) => item.value);
};
