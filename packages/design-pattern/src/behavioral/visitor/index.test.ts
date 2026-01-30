import { describe, it, expect, spyOn } from 'bun:test';
import { ConcreteComponentA, ConcreteComponentB, ConcreteVisitor1, ConcreteVisitor2 } from './index';

describe('Visitor Pattern', () => {
    it('should allow visitors to operate on components', () => {
        const components = [new ConcreteComponentA(), new ConcreteComponentB()];
        const visitor1 = new ConcreteVisitor1();
        const visitor2 = new ConcreteVisitor2();

        const visitor1SpyA = spyOn(visitor1, 'visitConcreteComponentA');
        const visitor1SpyB = spyOn(visitor1, 'visitConcreteComponentB');
        const visitor2SpyA = spyOn(visitor2, 'visitConcreteComponentA');
        const visitor2SpyB = spyOn(visitor2, 'visitConcreteComponentB');

        for (const component of components) {
            component.accept(visitor1);
            component.accept(visitor2);
        }

        expect(visitor1SpyA).toHaveBeenCalledWith(components[0]);
        expect(visitor1SpyB).toHaveBeenCalledWith(components[1]);
        expect(visitor2SpyA).toHaveBeenCalledWith(components[0]);
        expect(visitor2SpyB).toHaveBeenCalledWith(components[1]);
    });
});
