// A PriorityQueue is a special type of Queue where each element is associated with a priority and is served according to its priority.
// If elements with the same priority are present, they are served according to their order in the queue.

// In this implementation, a lower number for priority means a higher priority.

interface QElement<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T> {
  private items: QElement<T>[] = [];

  // Add a new element with a given priority
  enqueue(element: T, priority: number): void {
    const qElement: QElement<T> = { element, priority };
    let contain = false;

    // iterating through the entire item array to add element at the correct location of the Queue
    for (let i = 0; i < this.items.length; i++) {
      const currentItem = this.items[i];
      if (currentItem && currentItem.priority > qElement.priority) {
        this.items.splice(i, 0, qElement);
        contain = true;
        break;
      }
    }

    // if the element have the highest priority it is added at the end of the queue
    if (!contain) {
      this.items.push(qElement);
    }
  }

  // Remove the element from the front of the queue
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    // shift() will not return undefined here due to the isEmpty check
    return this.items.shift()!.element;
  }

  // Return the front element of the queue
  front(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[0]?.element;
  }

  // Return the last element of the queue
  rear(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.items.length - 1]?.element;
  }

  // Check if the queue is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Return the size of the queue
  size(): number {
    return this.items.length;
  }

  // Print the queue
  printPQueue(): string {
    let str = '';
    for (const item of this.items) {
      str += item.element + ' ';
    }
    return str;
  }
}
