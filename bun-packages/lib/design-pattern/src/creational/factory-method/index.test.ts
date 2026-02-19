import { describe, it, expect } from 'bun:test';
import { ConcreteCreator1, ConcreteCreator2 } from './index';

describe('Factory Method Pattern', () => {
    it('should create ConcreteProduct1 using ConcreteCreator1', () => {
        const creator = new ConcreteCreator1();
        const result = creator.someOperation();
        expect(result).toBe('Creator: The same creator\'s code has just worked with {Result of the ConcreteProduct1}');
    });

    it('should create ConcreteProduct2 using ConcreteCreator2', () => {
        const creator = new ConcreteCreator2();
        const result = creator.someOperation();
        expect(result).toBe('Creator: The same creator\'s code has just worked with {Result of the ConcreteProduct2}');
    });
});
