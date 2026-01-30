// A simple async queue to demonstrate the Producer-Consumer pattern.
export class AsyncQueue<T> {
    private queue: T[] = [];
    private waitingResolvers: ((value: T) => void)[] = [];

    // Producer adds an item to the queue.
    public enqueue(item: T): void {
        if (this.waitingResolvers.length > 0) {
            // If a consumer is waiting, resolve its promise directly.
            const resolve = this.waitingResolvers.shift();
            if (resolve) {
                resolve(item);
            }
        } else {
            this.queue.push(item);
        }
    }

    // Consumer takes an item from the queue.
    public async dequeue(): Promise<T> {
        if (this.queue.length > 0) {
            // If items are available, return one immediately.
            return Promise.resolve(this.queue.shift()!);
        }

        // If no items are available, wait for one to be enqueued.
        return new Promise(resolve => {
            this.waitingResolvers.push(resolve);
        });
    }

    public get size(): number {
        return this.queue.length;
    }
}
