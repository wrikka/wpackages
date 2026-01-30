export interface SuffixTreeNode {
	children: Map<string, SuffixTreeNode>;
	suffixIndex?: number;
}

export class SuffixTree {
	root: SuffixTreeNode;

	constructor(s: string) {
		this.root = { children: new Map() };
		this.build(s);
	}

	private build(s: string): void {
		for (let i = 0; i < s.length; i++) {
			this.insertSuffix(s.slice(i), i);
		}
	}

	private insertSuffix(suffix: string, index: number): void {
		let node = this.root;

		for (const char of suffix) {
			if (!node.children.has(char)) {
				node.children.set(char, { children: new Map() });
			}
			node = node.children.get(char)!;
		}

		node.suffixIndex = index;
	}

	search(pattern: string): number[] | null {
		let node = this.root;

		for (const char of pattern) {
			if (!node.children.has(char)) {
				return null;
			}
			node = node.children.get(char)!;
		}

		const result: number[] = [];
		this.collectSuffixIndices(node, result);
		return result;
	}

	private collectSuffixIndices(node: SuffixTreeNode, result: number[]): void {
		if (node.suffixIndex !== undefined) {
			result.push(node.suffixIndex);
		}

		for (const child of node.children.values()) {
			this.collectSuffixIndices(child, result);
		}
	}
}

export function suffixTreeSearch(text: string, pattern: string): number[] | null {
	const tree = new SuffixTree(text);
	return tree.search(pattern);
}
