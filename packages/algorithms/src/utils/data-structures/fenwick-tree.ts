export class FenwickTree {
	private tree: number[];
	private size: number;

	constructor(size: number) {
		this.size = size;
		this.tree = Array(size + 1).fill(0);
	}

	update(index: number, delta: number): void {
		while (index <= this.size) {
			this.tree[index]! += delta;
			index += index & -index;
		}
	}

	query(index: number): number {
		let sum = 0;
		while (index > 0) {
			sum += this.tree[index]!;
			index -= index & -index;
		}
		return sum;
	}

	rangeQuery(left: number, right: number): number {
		return this.query(right) - this.query(left - 1);
	}
}
