export class SegmentTree {
	private tree: number[];
	private size: number;

	constructor(data: number[]) {
		this.size = data.length;
		this.tree = Array(4 * this.size).fill(0);
		this.build(data, 0, 0, this.size - 1);
	}

	private build(data: number[], node: number, start: number, end: number): void {
		if (start === end) {
			this.tree[node]! = data[start]!;
			return;
		}

		const mid = Math.floor((start + end) / 2);
		this.build(data, 2 * node + 1, start, mid);
		this.build(data, 2 * node + 2, mid + 1, end);
		this.tree[node]! = this.tree[2 * node + 1]! + this.tree[2 * node + 2]!;
	}

	update(index: number, value: number): void {
		this.updateHelper(0, 0, this.size - 1, index, value);
	}

	private updateHelper(node: number, start: number, end: number, index: number, value: number): void {
		if (start === end) {
			this.tree[node]! = value;
			return;
		}

		const mid = Math.floor((start + end) / 2);
		if (index <= mid) {
			this.updateHelper(2 * node + 1, start, mid, index, value);
		} else {
			this.updateHelper(2 * node + 2, mid + 1, end, index, value);
		}
		this.tree[node]! = this.tree[2 * node + 1]! + this.tree[2 * node + 2]!;
	}

	query(left: number, right: number): number {
		return this.queryHelper(0, 0, this.size - 1, left, right);
	}

	private queryHelper(node: number, start: number, end: number, left: number, right: number): number {
		if (left > end || right < start) return 0;
		if (left <= start && end <= right) return this.tree[node]!;

		const mid = Math.floor((start + end) / 2);
		return this.queryHelper(2 * node + 1, start, mid, left, right) + this.queryHelper(2 * node + 2, mid + 1, end, left, right);
	}
}
