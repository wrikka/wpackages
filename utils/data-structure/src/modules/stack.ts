import { LinkedList } from './linked-list';

export class Stack<T> {
  private list = new LinkedList<T>();

  public push(value: T): void {
    this.list.insertFirst(value);
  }

  public pop(): T | null {
    return this.list.removeFirst();
  }

  public peek(): T | null {
    const head = this.list.getHead();
    return head ? head.value : null;
  }

  public isEmpty(): boolean {
    return this.list.getSize() === 0;
  }

  public getSize(): number {
    return this.list.getSize();
  }
}
