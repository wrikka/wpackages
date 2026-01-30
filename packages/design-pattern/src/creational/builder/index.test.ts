import { describe, it, expect } from 'bun:test';
import { Director, ConcreteBuilder1 } from './index';

describe('Builder Pattern', () => {
    it('should build a minimal viable product', () => {
        const director = new Director();
        const builder = new ConcreteBuilder1();
        director.setBuilder(builder);

        director.buildMinimalViableProduct();
        const product = builder.getProduct();

        expect(product.parts).toEqual(['PartA1']);
    });

    it('should build a full featured product', () => {
        const director = new Director();
        const builder = new ConcreteBuilder1();
        director.setBuilder(builder);

        director.buildFullFeaturedProduct();
        const product = builder.getProduct();

        expect(product.parts).toEqual(['PartA1', 'PartB1', 'PartC1']);
    });

    it('should be able to build products without a director', () => {
        const builder = new ConcreteBuilder1();
        builder.producePartA();
        builder.producePartC();
        const product = builder.getProduct();

        expect(product.parts).toEqual(['PartA1', 'PartC1']);
    });
});
