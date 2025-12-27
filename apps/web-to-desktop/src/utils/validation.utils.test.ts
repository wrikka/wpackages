import { describe, it, expect } from 'vitest';
import { validateUrl } from './validation.utils';

describe('validation utils', () => {
  it('should validate a URL', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
    expect(validateUrl('invalid-url')).toBe(false);
  });
});
