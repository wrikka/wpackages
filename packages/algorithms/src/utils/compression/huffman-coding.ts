import { createPriorityQueue, pqDequeue, pqEnqueue, pqSize } from "../data-structures";

interface HuffmanNode {
	char: string | null;
	freq: number;
	left: HuffmanNode | null;
	right: HuffmanNode | null;
}

export interface HuffmanResult {
	codes: Record<string, string>;
	encodedString: string;
}

// Calculate character frequencies
const calculateFrequencies = (text: string): Map<string, number> => {
	const freqMap = new Map<string, number>();
	for (const char of text) {
		freqMap.set(char, (freqMap.get(char) || 0) + 1);
	}
	return freqMap;
};

// Build the Huffman Tree
const buildHuffmanTree = (freqMap: Map<string, number>): HuffmanNode | null => {
	const pq = createPriorityQueue<HuffmanNode>();

	for (const [char, freq] of freqMap.entries()) {
		const node: HuffmanNode = { char, freq, left: null, right: null };
		pqEnqueue(pq, node, freq);
	}

	while (pqSize(pq) > 1) {
		const leftNode = pqDequeue(pq);
		const rightNode = pqDequeue(pq);

		if (leftNode && rightNode && 'freq' in leftNode && 'freq' in rightNode) {
			const newNode: HuffmanNode = {
				char: null,
				freq: leftNode.freq + rightNode.freq,
				left: leftNode as HuffmanNode,
				right: rightNode as HuffmanNode,
			};
			pqEnqueue(pq, newNode, newNode.freq);
		}
	}

	const rootNode = pqDequeue(pq);
	return rootNode as HuffmanNode ?? null;
};

// Generate Huffman codes from the tree
const generateCodes = (
	node: HuffmanNode | null,
	prefix = "",
	codes: Record<string, string> = {},
): Record<string, string> => {
	if (!node) {
		return codes;
	}

	if (node.char !== null) {
		codes[node.char] = prefix || "0"; // Handle single-character case
	}

	generateCodes(node.left, prefix + "0", codes);
	generateCodes(node.right, prefix + "1", codes);

	return codes;
};

export function huffmanCoding(text: string): HuffmanResult | null {
	if (text.length === 0) {
		return { codes: {}, encodedString: "" };
	}

	const freqMap = calculateFrequencies(text);
	const root = buildHuffmanTree(freqMap);
	const codes = generateCodes(root);

	if (Object.keys(codes).length === 0) {
		return null; // Should not happen with non-empty string
	}

	let encodedString = "";
	for (const char of text) {
		encodedString += codes[char] ?? "";
	}

	return { codes, encodedString };
}
