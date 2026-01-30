import { describe, it, expect } from 'bun:test';
import { runWorker } from './index';

describe('Bun Workers Pattern', () => {
    it('should receive a result from the worker thread', async () => {
        const result = await runWorker();
        expect(result).toEqual({ result: 420 });
    });
});
