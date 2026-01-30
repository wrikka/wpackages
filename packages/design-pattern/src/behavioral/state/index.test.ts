import { describe, it, expect, spyOn } from 'bun:test';
import { Context, ConcreteStateA, ConcreteStateB } from './index';

describe('State Pattern', () => {
    it('should change state and behavior accordingly', () => {
        const stateA = new ConcreteStateA();
        const context = new Context(stateA);

        const transitionToSpy = spyOn(context, 'transitionTo');

        // Initial state is A
        context.request1(); // Should transition to B
        expect(transitionToSpy).toHaveBeenCalledWith(expect.any(ConcreteStateB));

        context.request2(); // Should transition back to A
        expect(transitionToSpy).toHaveBeenCalledWith(expect.any(ConcreteStateA));
    });
});
