import { describe, it, expect, beforeEach } from 'vitest';
import { Trie } from './core/trie';

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
    trie.insert('apple');
    trie.insert('app');
    trie.insert('apricot');
    trie.insert('banana');
  });

  it('should insert and search for words correctly', () => {
    expect(trie.search('apple')).toBe(true);
    expect(trie.search('app')).toBe(true);
    expect(trie.search('apricot')).toBe(true);
    expect(trie.search('banana')).toBe(true);
    expect(trie.search('appl')).toBe(false);
    expect(trie.search('apples')).toBe(false);
    expect(trie.search('orange')).toBe(false);
  });

  it('should check for prefixes correctly', () => {
    expect(trie.startsWith('ap')).toBe(true);
    expect(trie.startsWith('app')).toBe(true);
    expect(trie.startsWith('ban')).toBe(true);
    expect(trie.startsWith('bana')).toBe(true);
    expect(trie.startsWith('or')).toBe(false);
    expect(trie.startsWith('applea')).toBe(false);
  });
});
