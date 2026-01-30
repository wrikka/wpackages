import { describe, it, expect } from 'bun:test';
import { AsyncQueue } from './index';

describe('Producer-Consumer Pattern with AsyncQueue', () => {
    it('should allow a consumer to wait for and receive an item from a producer', async () => {
        const queue = new AsyncQueue<string>();

        // Consumer starts waiting before producer produces
        const consumerPromise = queue.dequeue();

        // Producer produces an item
        queue.enqueue('Hello, World!');

        const receivedItem = await consumerPromise;
        expect(receivedItem).toBe('Hello, World!');
    });

    it('should handle multiple producers and consumers in order', async () => {
        const queue = new AsyncQueue<number>();

        const producer = async () => {
            for (let i = 1; i <= 3; i++) {
                await new Promise(res => setTimeout(res, 10));
                queue.enqueue(i);
            }
        };

        const consumer = async () => {
            const results: number[] = [];
            for (let i = 0; i < 3; i++) {
                const item = await queue.dequeue();
                results.push(item);
            }
            return results;
        };

        const [_, consumerResult] = await Promise.all([producer(), consumer()]);

        expect(consumerResult).toEqual([1, 2, 3]);
    });
});
