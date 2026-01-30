import { describe, it, expect } from 'bun:test';
import { MonkeyHandler, SquirrelHandler, DogHandler } from './index';

describe('Chain of Responsibility Pattern', () => {
    it('should pass the request along the chain', () => {
        const monkey = new MonkeyHandler();
        const squirrel = new SquirrelHandler();
        const dog = new DogHandler();

        monkey.setNext(squirrel).setNext(dog);

        const requests = ['Nut', 'Banana', 'Cup of coffee'];
        const results: (string | null)[] = [];

        for (const request of requests) {
            results.push(monkey.handle(request));
        }

        expect(results).toEqual([
            'Squirrel: I\'ll eat the Nut.',
            'Monkey: I\'ll eat the Banana.',
            null
        ]);
    });
});
