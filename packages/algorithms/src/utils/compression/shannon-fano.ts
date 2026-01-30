export interface ShannonFanoNode {
	char: string | null;
	freq: number;
	left: ShannonFanoNode | null;
	right: ShannonFanoNode | null;
}

export interface ShannonFanoResult {
	codes: Record<string, string>;
	encodedString: string;
}

const sortByFrequency = (freqMap: Map<string, number>): Array<{ char: string; freq: number }> => {
	const entries = Array.from(freqMap.entries());
	return entries
		.map(([char, freq]) => ({ char, freq }))
		.sort((a, b) => b.freq - a.freq);
};

const buildShannonFanoTree = (
	symbols: Array<{ char: string; freq: number }>,
): ShannonFanoNode | null => {
	if (symbols.length === 0) {
		return null;
	}

	if (symbols.length === 1) {
		return { char: symbols[0]?.char ?? null, freq: symbols[0]?.freq ?? 0, left: null, right: null };
	}

	let splitIndex = 0;
	let leftSum = 0;
	let rightSum = symbols.reduce((sum, s) => sum + s.freq, 0);
	let minDiff = rightSum;

	for (let i = 0; i < symbols.length - 1; i++) {
		leftSum += symbols[i]?.freq ?? 0;
		rightSum -= symbols[i]?.freq ?? 0;
		const diff = Math.abs(leftSum - rightSum);
		if (diff < minDiff) {
			minDiff = diff;
			splitIndex = i + 1;
		}
	}

	const leftSymbols = symbols.slice(0, splitIndex);
	const rightSymbols = symbols.slice(splitIndex);

	return {
		char: null,
		freq: leftSymbols.reduce((sum, s) => sum + s.freq, 0) + rightSymbols.reduce((sum, s) => sum + s.freq, 0),
		left: buildShannonFanoTree(leftSymbols),
		right: buildShannonFanoTree(rightSymbols),
	};
};

const generateCodes = (
	node: ShannonFanoNode | null,
	prefix = "",
	codes: Record<string, string> = {},
): Record<string, string> => {
	if (!node) {
		return codes;
	}

	if (node.char !== null) {
		codes[node.char] = prefix || "0";
	}

	generateCodes(node.left, prefix + "0", codes);
	generateCodes(node.right, prefix + "1", codes);

	return codes;
};

export function shannonFanoCoding(text: string): ShannonFanoResult | null {
	if (text.length === 0) {
		return { codes: {}, encodedString: "" };
	}

	const freqMap = new Map<string, number>();
	for (const char of text) {
		freqMap.set(char, (freqMap.get(char) || 0) + 1);
	}

	const sortedSymbols = sortByFrequency(freqMap);
	const root = buildShannonFanoTree(sortedSymbols);
	const codes = generateCodes(root);

	if (Object.keys(codes).length === 0) {
		return null;
	}

	let encodedString = "";
	for (const char of text) {
		encodedString += codes[char] ?? "";
	}

	return { codes, encodedString };
}
