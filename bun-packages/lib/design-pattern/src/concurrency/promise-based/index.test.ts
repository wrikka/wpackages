import { describe, it, expect } from 'bun:test';
import { runAll, runAllSettled, runRace, runAny } from './index';

describe('Promise-based Concurrency Patterns', () => {
    it('Promise.all should resolve when all promises resolve', async () => {
        const result = await runAll();
        expect(result).toEqual(['Success 1', 'Success 2']);
    });

    it('Promise.allSettled should return status for all promises', async () => {
        const result = await runAllSettled();
        expect(result).toEqual([
            { status: 'fulfilled', value: 'Success' },
            { status: 'rejected', reason: 'Failure' },
        ]);
    });

    it('Promise.race should return the first promise that settles', async () => {
        const result = await runRace();
        expect(result).toBe('Fast');
    });

    it('Promise.any should return the first promise that fulfills', async () => {
        const result = await runAny();
        expect(result).toBe('Success');
    });
});
