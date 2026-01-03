import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Plugin, ReleaseOptions } from '../types';
import { release } from './release.service';
import { GitService } from './git.service';
import { VersionService } from './version.service';
import { ChangelogService } from './changelog.service';
import { PublishService } from './publish.service';

vi.mock('./git.service');
vi.mock('./version.service');
vi.mock('./changelog.service');
vi.mock('./publish.service');

describe('release service (Orchestrator)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(GitService).mockImplementation(() => ({
      isGitRepository: vi.fn().mockResolvedValue(true),
      hasUncommittedChanges: vi.fn().mockResolvedValue(false),
      hasRemote: vi.fn().mockResolvedValue(true),
      commit: vi.fn().mockResolvedValue(undefined),
      tag: vi.fn().mockResolvedValue(undefined),
      push: vi.fn().mockResolvedValue(undefined),
      getLastTag: vi.fn().mockResolvedValue('v1.0.0'),
      getCommits: vi.fn().mockResolvedValue([]),
    }));

    vi.mocked(VersionService).mockImplementation(() => ({
      getPackageInfo: vi.fn().mockResolvedValue({ name: 'test-pkg', version: '1.0.0' }),
      bumpVersion: vi.fn().mockResolvedValue({ from: '1.0.0', to: '1.0.1', type: 'patch' }),
      updatePackageJson: vi.fn().mockResolvedValue(undefined),
    }));

    vi.mocked(ChangelogService).mockImplementation(() => ({
      generate: vi.fn().mockResolvedValue('changelog content'),
      update: vi.fn().mockResolvedValue(undefined),
    }));

    vi.mocked(PublishService).mockImplementation(() => ({
      isPublished: vi.fn().mockResolvedValue(false),
      publish: vi.fn().mockResolvedValue(undefined),
    }));
  });

  it('should run the full release workflow correctly', async () => {
    const options: Partial<ReleaseOptions> = { type: 'patch' };
    const result = await release(options);

    const gitMocks = vi.mocked(GitService).mock.results[0].value;
    const versionMocks = vi.mocked(VersionService).mock.results[0].value;
    const changelogMocks = vi.mocked(ChangelogService).mock.results[0].value;
    const publishMocks = vi.mocked(PublishService).mock.results[0].value;

    expect(result.success).toBe(true);
    expect(result.version).toBe('1.0.1');
    expect(versionMocks.updatePackageJson).toHaveBeenCalledWith('1.0.1');
    expect(changelogMocks.update).toHaveBeenCalled();
    expect(gitMocks.commit).toHaveBeenCalled();
    expect(publishMocks.publish).toHaveBeenCalled();
  });

  it('should execute plugin hooks at each lifecycle stage', async () => {
    const hookFn = vi.fn();
    const testPlugin: Plugin = {
      name: 'test-plugin',
      hooks: {
        'before:validate': hookFn,
        'after:bumpVersion': hookFn,
        'before:publish': hookFn,
      },
    };

    await release({ type: 'patch', plugins: [testPlugin] });

    expect(hookFn).toHaveBeenCalledTimes(3);
  });

  it('should use a custom changelog renderer if provided', async () => {
    const customRenderer = vi.fn().mockReturnValue('custom changelog');
    await release({ type: 'patch', changelog: customRenderer });

    const changelogMocks = vi.mocked(ChangelogService).mock.results[0].value;
    expect(changelogMocks.generate).toHaveBeenCalledWith(
      '1.0.1',
      expect.any(Array),
      customRenderer
    );
  });

  it('should respect the dryRun option and not make changes', async () => {
    const result = await release({ type: 'patch', dryRun: true });

    const gitMocks = vi.mocked(GitService).mock.results[0].value;
    const versionMocks = vi.mocked(VersionService).mock.results[0].value;
    const publishMocks = vi.mocked(PublishService).mock.results[0].value;

    expect(result.success).toBe(true);
    expect(result.version).toBe('1.0.1');
    expect(versionMocks.updatePackageJson).not.toHaveBeenCalled();
    expect(gitMocks.commit).not.toHaveBeenCalled();
    expect(publishMocks.publish).not.toHaveBeenCalled();
  });
});
