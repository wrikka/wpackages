import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { glob } from 'glob';
import { rimraf } from 'rimraf';
import { cleanup } from './cleanup.service';

vi.mock('glob');
vi.mock('rimraf');

describe('cleanup service', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should find and delete specified targets', async () => {
    const targets = ['node_modules', 'dist'];
    const paths = ['/test/node_modules', '/test/dist'];
    
    vi.mocked(glob).mockResolvedValue(paths);
    vi.mocked(rimraf).mockResolvedValue(true);

    const results = await cleanup(targets);

    expect(glob).toHaveBeenCalledWith(['**/node_modules', '**/dist'], { dot: true, ignore: '**/node_modules/**/node_modules/**' });
    expect(rimraf).toHaveBeenCalledTimes(2);
    expect(rimraf).toHaveBeenCalledWith('/test/node_modules');
    expect(rimraf).toHaveBeenCalledWith('/test/dist');
    expect(results).toEqual([
      { status: 'fulfilled', path: '/test/node_modules' },
      { status: 'fulfilled', path: '/test/dist' },
    ]);
  });

  it('should handle cleanup failures', async () => {
    const targets = ['dist'];
    const paths = ['/test/dist'];
    const error = new Error('Permission denied');

    vi.mocked(glob).mockResolvedValue(paths);
    vi.mocked(rimraf).mockRejectedValue(error);

    const results = await cleanup(targets);

    expect(results).toEqual([
      { status: 'rejected', path: '/test/dist', reason: error },
    ]);
  });
});
