// Simple hash function 1
const hash1 = (str: string, size: number): number => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash) % size;
};

// Simple hash function 2
const hash2 = (str: string, size: number): number => {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) + hash + char; /* hash * 33 + c */
	}
	return Math.abs(hash) % size;
};

export class BloomFilter {
	private readonly bitArray: boolean[];
	private readonly size: number;
	private readonly numHashes: number;

	constructor(size: number = 100, numHashes: number = 4) {
		this.size = size;
		this.bitArray = Array.from({ length: size }, () => false);
		this.numHashes = numHashes;
	}

	add(item: string): void {
		for (let i = 0; i < this.numHashes; i++) {
			const index = this.getHash(item, i);
			this.bitArray[index] = true;
		}
	}

	has(item: string): boolean {
		for (let i = 0; i < this.numHashes; i++) {
			const index = this.getHash(item, i);
			if (!this.bitArray[index]) {
				return false;
			}
		}
		return true;
	}

	private getHash(item: string, i: number): number {
		// Double hashing to generate multiple hash values
		const h1 = hash1(item, this.size);
		const h2 = hash2(item, this.size);
		return (h1 + i * h2) % this.size;
	}
}
