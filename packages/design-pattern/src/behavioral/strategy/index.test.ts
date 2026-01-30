import { describe, it, expect } from 'bun:test';
import { Context, ConcreteStrategyA, ConcreteStrategyB } from './index';

describe('Strategy Pattern', () => {
    it('should use ConcreteStrategyA', () => {
        const context = new Context(new ConcreteStrategyA());
        const data = ['e', 'a', 'c', 'b', 'd'];
        const result = context['strategy'].doAlgorithm([...data]);
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should use ConcreteStrategyB', () => {
        const context = new Context(new ConcreteStrategyB());
        const data = ['a', 'b', 'c', 'd', 'e'];
        const result = context['strategy'].doAlgorithm([...data]);
        expect(result).toEqual(['e', 'd', 'c', 'b', 'a']);
    });

    it('should be able to switch strategies', () => {
        const context = new Context(new ConcreteStrategyA());
        const data = ['e', 'a', 'c', 'b', 'd'];
        const resultA = context['strategy'].doAlgorithm([...data]);
        expect(resultA).toEqual(['a', 'b', 'c', 'd', 'e']);

        context.setStrategy(new ConcreteStrategyB());
        const resultB = context['strategy'].doAlgorithm([...data]);
        expect(resultB).toEqual(['d', 'b', 'c', 'a', 'e']); // Note: reverse is on original unsorted array
    });
});
