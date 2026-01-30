import { describe, it, expect, vi, type Mock } from 'vitest';
import { promises as fs } from 'node:fs';
import { runCommand } from './command.service';
import { generateProject, buildProject } from './tauri.service';

vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));
vi.mock('./command.service', () => ({
  runCommand: vi.fn(),
}));

describe('tauri service', () => {
  it('should generate a new project', async () => {
    (fs.readFile as Mock).mockResolvedValue('{}');
    (fs.writeFile as Mock).mockResolvedValue(undefined);
    (runCommand as Mock).mockResolvedValue({ stdout: '', stderr: '' });

    const config = {
      url: 'https://example.com',
      name: 'my-app',
      identifier: 'com.wts.my-app',
    };

    const projectDir = await generateProject(config);

    expect(runCommand).toHaveBeenCalledWith(
      expect.stringContaining('npx @tauri-apps/cli init'),
      expect.any(Object)
    );
    expect(fs.writeFile).toHaveBeenCalled();
    expect(projectDir).toContain('my-app');
  });

  it('should build a project', async () => {
    (runCommand as Mock).mockResolvedValue({ stdout: '', stderr: '' });

    await buildProject('/fake/dir');

    expect(runCommand).toHaveBeenCalledWith('bun install', { cwd: '/fake/dir' });
    expect(runCommand).toHaveBeenCalledWith('bun run build', { cwd: '/fake/dir' });
  });
});
