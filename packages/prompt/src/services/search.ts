export interface SearchOptions<_T> {
	caseSensitive?: boolean;
	fuzzy?: boolean;
	threshold?: number;
}

export const search = <T>(
	items: T[],
	query: string,
	getLabel: (item: T) => string,
	options: SearchOptions<T> = {},
): T[] => {
	const { caseSensitive = false, fuzzy = false, threshold = 0.6 } = options;

	if (!query) {
		return items;
	}

	const searchQuery = caseSensitive ? query : query.toLowerCase();

	return items.filter((item) => {
		const label = getLabel(item);
		const searchLabel = caseSensitive ? label : label.toLowerCase();

		if (fuzzy) {
			return fuzzyMatch(searchQuery, searchLabel, threshold);
		}

		return searchLabel.includes(searchQuery);
	});
};

const fuzzyMatch = (query: string, text: string, threshold: number): boolean => {
	const queryLen = query.length;
	const textLen = text.length;

	if (queryLen > textLen) {
		return false;
	}

	let queryIndex = 0;
	let matchCount = 0;

	for (let i = 0; i < textLen && queryIndex < queryLen; i++) {
		if (text[i] === query[queryIndex]) {
			queryIndex++;
			matchCount++;
		}
	}

	const score = matchCount / queryLen;
	return score >= threshold;
};
