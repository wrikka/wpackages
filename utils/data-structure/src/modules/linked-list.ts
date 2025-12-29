import { ListNode } from '../types/list-node';

export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private size = 0;

  public insertFirst(value: T): void {
    const newNode = new ListNode(value, this.head);
    this.head = newNode;
    if (!this.tail) {
      this.tail = newNode;
    }
    this.size++;
  }

  public insertLast(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let currentNode = this.head;
    while (currentNode) {
      result.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return result;
  }

  public getSize(): number {
    return this.size;
  }

  public removeFirst(): T | null {
    if (!this.head) {
      return null;
    }

    const value = this.head.value;
    this.head = this.head.next;
    this.size--;

    if (!this.head) {
      this.tail = null;
    }

    return value;
  }

  public getHead(): ListNode<T> | null {
    return this.head;
  }
}
