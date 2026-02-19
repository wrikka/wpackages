import { describe, it, expect } from 'bun:test';
import { FlyweightFactory } from './index';

describe('Flyweight Pattern', () => {
    it('should create and reuse flyweights', () => {
        const factory = new FlyweightFactory([
            ['Chevrolet', 'Camaro2018', 'pink'],
            ['Mercedes Benz', 'C300', 'black'],
            ['Mercedes Benz', 'C500', 'red'],
            ['BMW', 'M5', 'red'],
            ['BMW', 'X6', 'white'],
        ]);

        factory.listFlyweights();

        const flyweight1 = factory.getFlyweight(['BMW', 'M5', 'red']);
        const flyweight2 = factory.getFlyweight(['BMW', 'M5', 'red']);

        expect(flyweight1).toBe(flyweight2);
    });
});
