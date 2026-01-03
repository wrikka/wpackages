import { describe, it, expect } from 'bun:test';
import { createDiff } from './createDiff';
import { diff } from './diff';

describe('diff', () => {
  it('should handle circular references', () => {
    const obj1: any = { a: 1 };
    obj1.b = obj1;

    const obj2: any = { a: 1 };
    obj2.b = obj2;

    const obj3: any = { a: 2 };
    obj3.b = obj3;

    expect(diff(obj1, obj2)).toBeUndefined();
    expect(diff(obj1, obj3)).toBeDefined();
  });

  it('should return undefined for equal objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(diff(obj1, obj2)).toBeUndefined();
  });

  it('should return structured diff for objects with different property values', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    const result = diff(obj1, obj2);
    expect(result).toEqual({
      added: {},
      deleted: {},
      updated: {
        b: {
          added: {},
          deleted: {},
          updated: { c: { __old: 2, __new: 3 } },
        },
      },
    });
  });

  it('should return structured diff for objects with missing properties', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: {} };
    const result = diff(obj1, obj2);
    expect(result).toEqual({
      added: {},
      deleted: {},
      updated: {
        b: {
          added: {},
          deleted: { c: 2 },
          updated: {},
        },
      },
    });
  });

  it('should return structured diff for objects with added properties', () => {
    const obj1 = { a: 1, b: {} };
    const obj2 = { a: 1, b: { c: 2 } };
    const result = diff(obj1, obj2);
    expect(result).toEqual({
      added: {},
      deleted: {},
      updated: {
        b: {
          added: { c: 2 },
          deleted: {},
          updated: {},
        },
      },
    });
  });
});

describe('diff with Maps and Sets', () => {
  it('should return undefined for equal Maps', () => {
    const map1 = new Map<string, any>([['a', 1], ['b', { c: 2 }]]);
    const map2 = new Map<string, any>([['a', 1], ['b', { c: 2 }]]);
    expect(diff(map1, map2)).toBeUndefined();
  });

  it('should diff Maps with different values', () => {
    const map1 = new Map<string, any>([['a', 1], ['b', 2]]);
    const map2 = new Map<string, any>([['a', 1], ['b', 3]]);
    const result = diff(map1, map2);
    expect(result).toEqual({
      added: {},
      deleted: {},
      updated: { b: { __old: 2, __new: 3 } },
    });
  });

  it('should diff Maps with added keys', () => {
    const map1 = new Map<string, any>([['a', 1]]);
    const map2 = new Map<string, any>([['a', 1], ['b', 2]]);
    const result = diff(map1, map2);
    expect(result).toEqual({
      added: { b: 2 },
      deleted: {},
      updated: {},
    });
  });

  it('should diff Maps with deleted keys', () => {
    const map1 = new Map<string, any>([['a', 1], ['b', 2]]);
    const map2 = new Map<string, any>([['a', 1]]);
    const result = diff(map1, map2);
    expect(result).toEqual({
      added: {},
      deleted: { b: 2 },
      updated: {},
    });
  });

  it('should return undefined for equal Sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([1, 2, 3]);
    expect(diff(set1, set2)).toBeUndefined();
  });

  it('should diff Sets with different values', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([1, 2, 4]);
    const result = diff(set1, set2);
    expect(result).toEqual({
      added: { values: [4] },
      deleted: { values: [3] },
      updated: {},
    });
  });

  it('should handle type mismatch between object and Map', () => {
    const obj = { a: 1 };
    const map = new Map<string, any>([['a', 1]]);
    const result = diff(obj, map);
    expect(result?.updated.value.__old).toEqual(obj);
    expect(result?.updated.value.__new).toEqual(map);
  });
});

describe('diff with options', () => {
    it('should use customEqual function for comparison', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 3 };

        // Without customEqual, they are different
        expect(diff(obj1, obj2)).toBeDefined();

        // With customEqual that always returns true, they are equal
        const customEqual = () => true;
        expect(diff(obj1, obj2, { customEqual })).toBeUndefined();
    });

    it('should ignore specified paths', () => {
        const obj1 = { a: 1, b: { c: 2 }, d: 4 };
        const obj2 = { a: 1, b: { c: 3 }, d: 5 };

        const result = diff(obj1, obj2, { ignorePaths: ['b.c'] });

        expect(result).toEqual({
            added: {},
            deleted: {},
            updated: {
                d: { __old: 4, __new: 5 }
            }
        });
    });

    it('should ignore nested object paths', () => {
        const obj1 = { a: { b: { c: 1 } } };
        const obj2 = { a: { b: { c: 2 } } };

        const result = diff(obj1, obj2, { ignorePaths: ['a.b'] });
        expect(result).toBeUndefined();
    });
});

describe('createDiff', () => {
  it('should return an empty string for equal objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(createDiff(obj1, obj2)).toBe('');
  });

  it('should diff objects with different property values', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    const diff = createDiff(obj1, obj2);
    expect(diff).toContain('- c: 2');
    expect(diff).toContain('+ c: 3');
  });

  it('should diff objects with missing properties', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: {} };
    const diff = createDiff(obj1, obj2);
    expect(diff).toContain('- c: 2');
  });

  it('should diff objects with added properties', () => {
    const obj1 = { a: 1, b: {} };
    const obj2 = { a: 1, b: { c: 2 } };
    const diff = createDiff(obj1, obj2);
    expect(diff).toContain('+ c: 2');
  });

  it('should handle nested object diffs', () => {
    const obj1 = { a: 1, b: { c: { d: 4 } } };
    const obj2 = { a: 1, b: { c: { d: 5 } } };
    const diff = createDiff(obj1, obj2);
    expect(diff).toContain('- d: 4');
    expect(diff).toContain('+ d: 5');
  });

  it('should show no difference for deeply equal nested objects', () => {
    const obj1 = { a: 1, b: { c: { d: 4 } }, common: { x: 1 } };
    const obj2 = { a: 1, b: { c: { d: 4 } }, common: { x: 1 } };
    expect(createDiff(obj1, obj2)).toBe('');
  });

  it('should correctly diff strings line by line', () => {
    const str1 = 'hello\nworld';
    const str2 = 'hello\nuniverse';
    const diff = createDiff(str1, str2);
    expect(diff).toContain('- world');
    expect(diff).toContain('+ universe');
  });
});
