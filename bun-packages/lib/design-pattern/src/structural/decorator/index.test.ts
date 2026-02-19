import { describe, it, expect } from 'bun:test';
import { ConcreteComponent, ConcreteDecoratorA, ConcreteDecoratorB } from './index';

describe('Decorator Pattern', () => {
    it('should return the base operation for a simple component', () => {
        const simple = new ConcreteComponent();
        expect(simple.operation()).toBe('ConcreteComponent');
    });

    it('should be able to wrap a component with multiple decorators', () => {
        const simple = new ConcreteComponent();
        const decorator1 = new ConcreteDecoratorA(simple);
        const decorator2 = new ConcreteDecoratorB(decorator1);

        const result = decorator2.operation();
        expect(result).toBe('ConcreteDecoratorB(ConcreteDecoratorA(ConcreteComponent))');
    });
});
