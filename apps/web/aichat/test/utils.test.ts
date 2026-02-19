import { describe, expect, it } from 'vitest';
import { formatDate, generateId } from '~/app/utils/common';

describe('Utils', () => {
  it('generateId creates a unique string', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  it('formatDate correctly formats a timestamp', () => {
    const timestamp = 1672531200000; // 2023-01-01 00:00:00 UTC
    const formatted = formatDate(timestamp);
    // Note: This will depend on the test runner's locale.
    // A more robust test would mock the locale.
    expect(formatted).toContain('1/1/2023');
  });
});
