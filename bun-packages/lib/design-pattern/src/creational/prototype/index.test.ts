import { describe, it, expect } from 'bun:test';
import { Prototype, ComponentWithBackReference } from './index';

describe('Prototype Pattern', () => {
    it('should clone a prototype with primitive values', () => {
        const p1 = new Prototype();
        p1.primitive = 245;
        const p2 = p1.clone();

        expect(p1.primitive).toBe(p2.primitive);
    });

    it('should clone a prototype with component objects', () => {
        const p1 = new Prototype();
        p1.component = new Date();
        const p2 = p1.clone();

        expect(p1.component).not.toBe(p2.component);
    });

    it('should handle circular references when cloning', () => {
        const p1 = new Prototype();
        p1.circularReference = new ComponentWithBackReference(p1);
        const p2 = p1.clone();

        expect(p1.circularReference).not.toBe(p2.circularReference);
        expect(p1.circularReference.prototype).not.toBe(p2.circularReference.prototype);
        expect(p2.circularReference.prototype).toBe(p2);
    });
});
