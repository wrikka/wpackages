import { describe, it, expect } from 'bun:test';
import { ConcreteFactory1, ConcreteFactory2 } from './index';

describe('Abstract Factory Pattern', () => {
    it('should create products of variant 1 using ConcreteFactory1', () => {
        const factory = new ConcreteFactory1();
        const productA = factory.createProductA();
        const productB = factory.createProductB();

        expect(productA.usefulFunctionA()).toBe('The result of the product A1.');
        expect(productB.usefulFunctionB()).toBe('The result of the product B1.');
        expect(productB.anotherUsefulFunctionB(productA)).toBe('The result of the B1 collaborating with the (The result of the product A1.)');
    });

    it('should create products of variant 2 using ConcreteFactory2', () => {
        const factory = new ConcreteFactory2();
        const productA = factory.createProductA();
        const productB = factory.createProductB();

        expect(productA.usefulFunctionA()).toBe('The result of the product A2.');
        expect(productB.usefulFunctionB()).toBe('The result of the product B2.');
        expect(productB.anotherUsefulFunctionB(productA)).toBe('The result of the B2 collaborating with the (The result of the product A2.)');
    });
});
