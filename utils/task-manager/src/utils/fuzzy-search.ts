interface FuzzySearchOptions<T extends Record<string, unknown>> {
	keys: (keyof T)[];
}

export const fuzzySearch = <T extends Record<string, unknown>>(
	query: string,
	items: T[],
	options: FuzzySearchOptions<T>,
): T[] => {
	if (!query) return items;
	const lowerCaseQuery = query.toLowerCase();

	const scoredItems = items
		.map((item) => {
			let totalScore = 0;
			let isMatch = false;

			for (const key of options.keys) {
				const value = item[key];
				if (typeof value !== "string") continue;

				const lowerCaseValue = value.toLowerCase();
				let score = 0;
				let queryIndex = 0;
				let consecutiveMatches = 0;

				for (
					let i = 0;
					i < lowerCaseValue.length && queryIndex < lowerCaseQuery.length;
					i++
				) {
					if (lowerCaseValue[i] === lowerCaseQuery[queryIndex]) {
						score += 1 + consecutiveMatches * 2; // Bonus for consecutive matches
						consecutiveMatches++;
						queryIndex++;
					} else {
						consecutiveMatches = 0;
					}
				}

				if (queryIndex === lowerCaseQuery.length) {
					isMatch = true;
					totalScore += score;
				}
			}

			return isMatch ? { item, score: totalScore } : null;
		})
		.filter(Boolean) as { item: T; score: number }[];

	return scoredItems
		.sort((a, b) => b.score - a.score)
		.map((scored) => scored.item);
};
