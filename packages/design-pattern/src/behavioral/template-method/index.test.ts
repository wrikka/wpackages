import { describe, it, expect, spyOn } from 'bun:test';
import { ConcreteClass1, ConcreteClass2 } from './index';

describe('Template Method Pattern', () => {
    it('should execute the algorithm using ConcreteClass1', () => {
        const class1 = new ConcreteClass1();
        const required1Spy = spyOn(class1, 'requiredOperations1' as any);
        const required2Spy = spyOn(class1, 'requiredOperations2' as any);
        const hook1Spy = spyOn(class1, 'hook1' as any);

        class1.templateMethod();

        expect(required1Spy).toHaveBeenCalled();
        expect(required2Spy).toHaveBeenCalled();
        expect(hook1Spy).toHaveBeenCalled(); // hook1 is called, but has empty implementation
    });

    it('should execute the algorithm using ConcreteClass2 with overridden hook', () => {
        const class2 = new ConcreteClass2();
        const required1Spy = spyOn(class2, 'requiredOperations1' as any);
        const required2Spy = spyOn(class2, 'requiredOperations2' as any);
        const hook1Spy = spyOn(class2, 'hook1' as any);

        class2.templateMethod();

        expect(required1Spy).toHaveBeenCalled();
        expect(required2Spy).toHaveBeenCalled();
        expect(hook1Spy).toHaveBeenCalled(); // hook1 is called and has implementation
    });
});
