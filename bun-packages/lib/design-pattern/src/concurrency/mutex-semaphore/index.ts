// A simple Semaphore implementation to limit concurrency.
export class Semaphore {
    private permits: number;
    private queue: (() => void)[] = [];

    constructor(permits: number) {
        this.permits = permits;
    }

    public async acquire(): Promise<void> {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }

        // No permits available, wait in the queue
        return new Promise(resolve => {
            this.queue.push(resolve);
        });
    }

    public release(): void {
        if (this.queue.length > 0) {
            // Let the next waiting task proceed
            const next = this.queue.shift();
            if (next) {
                next();
            }
        } else {
            this.permits++;
        }
    }

    public async withLock<T>(fn: () => Promise<T>): Promise<T> {
        await this.acquire();
        try {
            return await fn();
        } finally {
            this.release();
        }
    }
}
