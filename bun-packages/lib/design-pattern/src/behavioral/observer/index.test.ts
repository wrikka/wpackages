import { describe, it, expect, spyOn } from 'bun:test';
import { ConcreteSubject, ConcreteObserverA, ConcreteObserverB } from './index';

describe('Observer Pattern', () => {
    it('should notify observers when state changes', () => {
        const subject = new ConcreteSubject();
        const observerA = new ConcreteObserverA();
        const observerB = new ConcreteObserverB();

        const observerASpy = spyOn(observerA, 'update');
        const observerBSpy = spyOn(observerB, 'update');

        subject.attach(observerA);
        subject.attach(observerB);

        subject.someBusinessLogic();

        expect(observerASpy).toHaveBeenCalledWith(subject);
        expect(observerBSpy).toHaveBeenCalledWith(subject);

        subject.detach(observerA);
        subject.someBusinessLogic();

        expect(observerASpy).toHaveBeenCalledTimes(1);
        expect(observerBSpy).toHaveBeenCalledTimes(2);
    });
});
