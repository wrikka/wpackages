import { describe, it, expect } from 'bun:test';
import { Facade } from './index';

describe('Facade Pattern', () => {
    it('should provide a simple interface to a complex subsystem', () => {
        const facade = new Facade();
        const result = facade.operation();

        const expected = 'Facade initializes subsystems:\n' +
                         'Subsystem1: Ready!\n' +
                         'Subsystem2: Get ready!\n' +
                         'Facade orders subsystems to perform the action:\n' +
                         'Subsystem1: Go!\n' +
                         'Subsystem2: Fire!';

        expect(result).toBe(expected);
    });
});
