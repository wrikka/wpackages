export class AVLNode<T> {
	value: T;
	left: AVLNode<T> | null;
	right: AVLNode<T> | null;
	height: number;

	constructor(value: T) {
		this.value = value;
		this.left = null;
		this.right = null;
		this.height = 1;
	}
}

export class AVLTree<T> {
	private root: AVLNode<T> | null = null;

	private getHeight(node: AVLNode<T> | null): number {
		return node ? node.height : 0;
	}

	private getBalance(node: AVLNode<T> | null): number {
		return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
	}

	private rightRotate(y: AVLNode<T>): AVLNode<T> {
		const x = y.left!;
		const T2 = x.right;

		x.right = y;
		y.left = T2;

		y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
		x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

		return x;
	}

	private leftRotate(x: AVLNode<T>): AVLNode<T> {
		const y = x.right!;
		const T2 = y.left;

		y.left = x;
		x.right = T2;

		x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
		y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

		return y;
	}

	insert(value: T): void {
		this.root = this.insertNode(this.root, value);
	}

	private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
		if (!node) return new AVLNode(value);

		if (value < node.value) {
			node.left = this.insertNode(node.left, value);
		} else if (value > node.value) {
			node.right = this.insertNode(node.right, value);
		} else {
			return node;
		}

		node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
		const balance = this.getBalance(node);

		if (balance > 1 && value < node.left!.value) {
			return this.rightRotate(node);
		}

		if (balance < -1 && value > node.right!.value) {
			return this.leftRotate(node);
		}

		if (balance > 1 && value > node.left!.value) {
			node.left = this.leftRotate(node.left!);
			return this.rightRotate(node);
		}

		if (balance < -1 && value < node.right!.value) {
			node.right = this.rightRotate(node.right!);
			return this.leftRotate(node);
		}

		return node;
	}

	search(value: T): boolean {
		return this.searchNode(this.root, value);
	}

	private searchNode(node: AVLNode<T> | null, value: T): boolean {
		if (!node) return false;
		if (value === node.value) return true;
		if (value < node.value) return this.searchNode(node.left, value);
		return this.searchNode(node.right, value);
	}
}
