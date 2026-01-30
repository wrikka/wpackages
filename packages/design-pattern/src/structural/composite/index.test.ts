import { describe, it, expect } from 'bun:test';
import { Leaf, Composite } from './index';

describe('Composite Pattern', () => {
    it('should return the correct operation for a leaf', () => {
        const leaf = new Leaf();
        expect(leaf.operation()).toBe('Leaf');
    });

    it('should return the correct operation for a composite', () => {
        const tree = new Composite();
        const branch1 = new Composite();
        branch1.add(new Leaf());
        branch1.add(new Leaf());

        const branch2 = new Composite();
        branch2.add(new Leaf());

        tree.add(branch1);
        tree.add(branch2);

        const result = tree.operation();
        expect(result).toBe('Branch(Branch(Leaf+Leaf)+Branch(Leaf))');
    });
});
