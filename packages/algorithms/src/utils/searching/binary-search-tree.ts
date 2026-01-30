export interface BSTNode<T> {
	value: T;
	left: BSTNode<T> | null;
	right: BSTNode<T> | null;
}

export class BinarySearchTree<T> {
	root: BSTNode<T> | null = null;

	insert(value: T): void {
		const newNode: BSTNode<T> = { value, left: null, right: null };

		if (this.root === null) {
			this.root = newNode;
			return;
		}

		let current = this.root;
		while (true) {
			if (value < current.value) {
				if (current.left === null) {
					current.left = newNode;
					return;
				}
				current = current.left;
			} else if (value > current.value) {
				if (current.right === null) {
					current.right = newNode;
					return;
				}
				current = current.right;
			} else {
				return;
			}
		}
	}

	search(value: T): boolean {
		let current = this.root;
		while (current !== null) {
			if (value === current.value) {
				return true;
			}
			if (value < current.value) {
				current = current.left;
			} else {
				current = current.right;
			}
		}
		return false;
	}

	inorderTraversal(): T[] {
		const result: T[] = [];
		const traverse = (node: BSTNode<T> | null) => {
			if (node === null) return;
			traverse(node.left);
			result.push(node.value);
			traverse(node.right);
		};
		traverse(this.root);
		return result;
	}
}

export function binarySearchTreeSearch<T>(values: T[], target: T): boolean {
	const bst = new BinarySearchTree<T>();
	for (const value of values) {
		bst.insert(value);
	}
	return bst.search(target);
}
