import { describe, it, expect } from 'bun:test';
import { Target, Adaptee, Adapter } from './index';

describe('Adapter Pattern', () => {
    it('should use the Target interface by default', () => {
        const target = new Target();
        const result = target.request();
        expect(result).toBe('Target: The default target\'s behavior.');
    });

    it('should adapt the Adaptee interface to the Target interface', () => {
        const adaptee = new Adaptee();
        const adapter = new Adapter(adaptee);
        const result = adapter.request();
        expect(result).toBe('Adapter: (TRANSLATED) Special behavior of the Adaptee.');
    });
});
