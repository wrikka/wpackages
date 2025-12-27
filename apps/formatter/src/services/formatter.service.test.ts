import { describe, it, expect, vi } from 'vitest';
import { format } from './formatter.service';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}));

describe('formatter service', () => {
  it('should call dprint with the correct paths', async () => {
    const execAsync = promisify(exec);
    (exec as vi.Mock).mockImplementation((command, callback) => {
      callback(null, { stdout: 'formatted', stderr: '' });
    });

    await format(['src', 'test']);

    expect(exec).toHaveBeenCalledWith(
      'npx dprint fmt src test',
      expect.any(Function)
    );
  });
});
