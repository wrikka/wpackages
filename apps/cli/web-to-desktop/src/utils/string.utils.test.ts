import { describe, it, expect } from 'vitest';
import { sanitizeName, generateIdentifier } from './string.utils';

describe('string utils', () => {
  it('should sanitize a name', () => {
    expect(sanitizeName(' My App ')).toBe('my-app');
    expect(sanitizeName('Another App')).toBe('another-app');
  });

  it('should generate an identifier', () => {
    expect(generateIdentifier('My App')).toBe('com.wts.my-app');
  });
});
