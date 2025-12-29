import { describe, it, expect } from 'vitest';
import { BinarySearchTree } from './core/binary-search-tree';

describe('BinarySearchTree', () => {
  it('should insert values correctly', () => {
    const bst = new BinarySearchTree<number>();
    bst.insert(10);
    bst.insert(5);
    bst.insert(15);
    bst.insert(3);
    bst.insert(7);

    expect(bst.root?.value).toBe(10);
    expect(bst.root?.left?.value).toBe(5);
    expect(bst.root?.right?.value).toBe(15);
    expect(bst.root?.left?.left?.value).toBe(3);
    expect(bst.root?.left?.right?.value).toBe(7);
  });

  it('should search for values correctly', () => {
    const bst = new BinarySearchTree<number>();
    bst.insert(10);
    bst.insert(5);
    bst.insert(15);

    expect(bst.search(10)).toBe(true);
    expect(bst.search(5)).toBe(true);
    expect(bst.search(15)).toBe(true);
    expect(bst.search(99)).toBe(false);
  });

  it('should perform in-order traversal correctly', () => {
    const bst = new BinarySearchTree<number>();
    bst.insert(10);
    bst.insert(5);
    bst.insert(15);
    bst.insert(3);
    bst.insert(7);

    const result: number[] = [];
    bst.inOrderTraversal((value) => result.push(value));

    expect(result).toEqual([3, 5, 7, 10, 15]);
  });

  it('should perform pre-order traversal correctly', () => {
    const bst = new BinarySearchTree<number>();
    bst.insert(10);
    bst.insert(5);
    bst.insert(15);
    bst.insert(3);
    bst.insert(7);

    const result: number[] = [];
    bst.preOrderTraversal((value) => result.push(value));

    expect(result).toEqual([10, 5, 3, 7, 15]);
  });

  it('should perform post-order traversal correctly', () => {
    const bst = new BinarySearchTree<number>();
    bst.insert(10);
    bst.insert(5);
    bst.insert(15);
    bst.insert(3);
    bst.insert(7);

    const result: number[] = [];
    bst.postOrderTraversal((value) => result.push(value));

    expect(result).toEqual([3, 7, 5, 15, 10]);
  });
});
