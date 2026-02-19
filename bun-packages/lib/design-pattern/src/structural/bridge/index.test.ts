import { describe, it, expect } from 'bun:test';
import { Abstraction, ExtendedAbstraction, ConcreteImplementationA, ConcreteImplementationB } from './index';

describe('Bridge Pattern', () => {
    it('should work with a base abstraction and implementation A', () => {
        const implementation = new ConcreteImplementationA();
        const abstraction = new Abstraction(implementation);
        const result = abstraction.operation();
        expect(result).toBe('Abstraction: Base operation with:\nConcreteImplementationA: Here\'s the result on platform A.');
    });

    it('should work with an extended abstraction and implementation B', () => {
        const implementation = new ConcreteImplementationB();
        const abstraction = new ExtendedAbstraction(implementation);
        const result = abstraction.operation();
        expect(result).toBe('ExtendedAbstraction: Extended operation with:\nConcreteImplementationB: Here\'s the result on platform B.');
    });
});
