/**
 * Fuzzy Matching Utilities (Pure Functions)
 */

/**
 * Simple fuzzy match with scoring
 */
export const fuzzyMatch = (query: string, target: string): number => {
	const q = query.toLowerCase();
	const t = target.toLowerCase();

	// Exact match
	if (t === q) return 1000;

	// Starts with
	if (t.startsWith(q)) return 500;

	// Contains
	if (t.includes(q)) return 250;

	// Character-by-character fuzzy match
	let score = 0;
	let qIndex = 0;

	for (let i = 0; i < t.length && qIndex < q.length; i++) {
		if (t[i] === q[qIndex]) {
			score += 10;
			qIndex++;
		}
	}

	// Return score if all query chars found
	return qIndex === q.length ? score : 0;
};

/**
 * Filter and sort items by fuzzy match score
 */
export const fuzzyFilter = <T>(
	query: string,
	items: readonly T[],
	getLabel: (item: T) => string,
	maxResults?: number,
): readonly T[] => {
	if (!query) return items;

	const scored = items
		.map((item) => ({
			item,
			score: fuzzyMatch(query, getLabel(item)),
		}))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score);

	const results = scored.map(({ item }) => item);

	return maxResults
		? Object.freeze(results.slice(0, maxResults))
		: Object.freeze(results);
};
