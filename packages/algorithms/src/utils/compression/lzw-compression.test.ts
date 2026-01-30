import { describe, it, expect } from 'vitest';
import { encode, decode } from './lzw-compression';

describe('LZW Compression', () => {
  it('should compress and decompress a simple string', () => {
    const original = 'TOBEORNOTTOBEORTOBEORNOT';
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded).toBe(original);
  });

  it('should handle a more complex string', () => {
    const original = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded).toBe(original);
  });

  it('should handle strings with repeating characters', () => {
    const original = 'AAAAAAAAAAAAAAA';
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded).toBe(original);
  });

  it('should handle an empty string', () => {
    const original = '';
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded).toBe(original);
  });
});
