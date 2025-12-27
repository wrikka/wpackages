import { describe, it, expect, vi } from 'vitest';
import { runBenchmark } from './benchmark.service';

describe('benchmark service', () => {
  it('should run a benchmark and return results', async () => {
    const fn = vi.fn();
    const result = await runBenchmark('test', fn, 100);

    expect(result.name).toBe('test');
    expect(result.hz).toBeGreaterThan(0);
    expect(result.mean).toBeGreaterThan(0);
    expect(result.p99).toBeGreaterThan(0);
    expect(result.min).toBeGreaterThanOrEqual(0);
    expect(result.max).toBeGreaterThan(0);
    expect(fn).toHaveBeenCalled();
  });
});
