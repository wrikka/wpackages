export enum Color {
	RED,
	BLACK,
}

export class RBNode<T> {
	value: T;
	left: RBNode<T> | null;
	right: RBNode<T> | null;
	parent: RBNode<T> | null;
	color: Color;

	constructor(value: T) {
		this.value = value;
		this.left = null;
		this.right = null;
		this.parent = null;
		this.color = Color.RED;
	}
}

export class RedBlackTree<T> {
	private root: RBNode<T> | null = null;

	insert(value: T): void {
		const newNode = new RBNode(value);
		let parent: RBNode<T> | null = null;
		let current = this.root;

		while (current !== null) {
			parent = current;
			if (value < current.value) {
				current = current.left;
			} else if (value > current.value) {
				current = current.right;
			} else {
				return;
			}
		}

		newNode.parent = parent;

		if (parent === null) {
			this.root = newNode;
		} else if (value < parent.value) {
			parent.left = newNode;
		} else {
			parent.right = newNode;
		}

		this.fixInsert(newNode);
	}

	private fixInsert(node: RBNode<T>): void {
		while (node !== this.root && node.parent?.color === Color.RED) {
			if (node.parent === node.parent.parent?.left) {
				const uncle = node.parent.parent.right;
				if (uncle?.color === Color.RED) {
					node.parent.color = Color.BLACK;
					uncle.color = Color.BLACK;
					node.parent.parent.color = Color.RED;
					node = node.parent.parent;
				} else {
					if (node === node.parent.right) {
						node = node.parent;
						this.leftRotate(node);
					}
					node.parent!.color = Color.BLACK;
					node.parent!.parent!.color = Color.RED;
					this.rightRotate(node.parent!.parent!);
				}
			} else {
				const uncle = node.parent!.parent!.left;
				if (uncle?.color === Color.RED) {
					node.parent!.color = Color.BLACK;
					uncle.color = Color.BLACK;
					node.parent!.parent!.color = Color.RED;
					node = node.parent!.parent!;
				} else {
					if (node === node.parent!.left) {
						node = node.parent!;
						this.rightRotate(node);
					}
					node.parent!.color = Color.BLACK;
					node.parent!.parent!.color = Color.RED;
					this.leftRotate(node.parent!.parent!);
				}
			}
		}
		this.root!.color = Color.BLACK;
	}

	private leftRotate(x: RBNode<T>): void {
		const y = x.right!;
		x.right = y.left;

		if (y.left !== null) {
			y.left.parent = x;
		}

		y.parent = x.parent;

		if (x.parent === null) {
			this.root = y;
		} else if (x === x.parent.left) {
			x.parent.left = y;
		} else {
			x.parent.right = y;
		}

		y.left = x;
		x.parent = y;
	}

	private rightRotate(y: RBNode<T>): void {
		const x = y.left!;
		y.left = x.right;

		if (x.right !== null) {
			x.right.parent = y;
		}

		x.parent = y.parent;

		if (y.parent === null) {
			this.root = x;
		} else if (y === y.parent.right) {
			y.parent.right = x;
		} else {
			y.parent.left = x;
		}

		x.right = y;
		y.parent = x;
	}

	search(value: T): boolean {
		return this.searchNode(this.root, value);
	}

	private searchNode(node: RBNode<T> | null, value: T): boolean {
		if (!node) return false;
		if (value === node.value) return true;
		if (value < node.value) return this.searchNode(node.left, value);
		return this.searchNode(node.right, value);
	}
}
