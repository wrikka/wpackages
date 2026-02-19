export class CountMinSketch {
	private width: number;
	private depth: number;
	private table: number[][];
	private hashSeeds: number[];

	constructor(width: number, depth: number) {
		this.width = width;
		this.depth = depth;
		this.table = Array(depth)
			.fill(0)
			.map(() => Array(width).fill(0));
		this.hashSeeds = Array.from({ length: depth }, (_, i) => i + 1);
	}

	private hash(value: string, seed: number): number {
		let hash = seed;
		for (let i = 0; i < value.length; i++) {
			hash = (hash << 5) - hash + value.charCodeAt(i);
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	add(value: string): void {
		for (let i = 0; i < this.depth; i++) {
			const hashValue = this.hash(value, this.hashSeeds[i]!);
			const index = hashValue % this.width;
			this.table[i]![index]!++;
		}
	}

	count(value: string): number {
		let minCount = Infinity;

		for (let i = 0; i < this.depth; i++) {
			const hashValue = this.hash(value, this.hashSeeds[i]!);
			const index = hashValue % this.width;
			minCount = Math.min(minCount, this.table[i]![index]!);
		}

		return minCount;
	}
}
