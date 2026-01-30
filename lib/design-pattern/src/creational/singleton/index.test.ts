import { describe, it, expect } from 'bun:test';
import { Singleton } from './index';

describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
        const s1 = Singleton.getInstance();
        const s2 = Singleton.getInstance();

        expect(s1).toBe(s2);
    });
});
