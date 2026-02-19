export class ListNode<T> {
	value: T;
	next: ListNode<T> | null;

	constructor(value: T) {
		this.value = value;
		this.next = null;
	}
}

export class LinkedList<T> {
	private head: ListNode<T> | null = null;
	private length = 0;

	append(value: T): void {
		const newNode = new ListNode(value);

		if (this.head === null) {
			this.head = newNode;
		} else {
			let current = this.head;
			while (current.next !== null) {
				current = current.next;
			}
			current.next = newNode;
		}

		this.length++;
	}

	prepend(value: T): void {
		const newNode = new ListNode(value);
		newNode.next = this.head;
		this.head = newNode;
		this.length++;
	}

	delete(value: T): boolean {
		if (this.head === null) return false;

		if (this.head.value === value) {
			this.head = this.head.next;
			this.length--;
			return true;
		}

		let current = this.head;
		while (current.next !== null) {
			if (current.next.value === value) {
				current.next = current.next.next;
				this.length--;
				return true;
			}
			current = current.next;
		}

		return false;
	}

	find(value: T): ListNode<T> | null {
		let current = this.head;
		while (current !== null) {
			if (current.value === value) {
				return current;
			}
			current = current.next;
		}
		return null;
	}

	size(): number {
		return this.length;
	}

	toArray(): T[] {
		const result: T[] = [];
		let current = this.head;
		while (current !== null) {
			result.push(current.value);
			current = current.next;
		}
		return result;
	}
}
