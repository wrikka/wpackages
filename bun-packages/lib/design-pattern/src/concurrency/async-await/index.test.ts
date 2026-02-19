import { describe, it, expect } from 'bun:test';
import { fetchDataWithHandling, parallelFetches } from './index';

describe('Async/Await Best Practices', () => {
    it('should handle errors gracefully using try...catch', async () => {
        const result = await fetchDataWithHandling();
        expect(result).toEqual({ error: 'API Failure' });
    });

    it('should execute independent promises in parallel', async () => {
        const startTime = Date.now();
        const results = await parallelFetches();
        const endTime = Date.now();

        // Both promises take 50ms, but run in parallel.
        // The total time should be slightly more than 50ms, not 100ms.
        expect(endTime - startTime).toBeLessThan(100);
        expect(results).toEqual([{ data: 'success' }, { data: 'success' }]);
    });
});
