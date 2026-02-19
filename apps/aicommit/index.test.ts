import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}));

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  select: vi.fn(),
  isCancel: vi.fn((value) => value === null),
  spinner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('node:os', () => ({
  homedir: vi.fn(() => '/home/user'),
}));

describe('aicommit', () => {
  let execSync: any;
  let ofetch: any;
  let prompts: any;

  beforeEach(async () => {
    // Dynamically import mocks to reset them before each test
    const cp = await import('node:child_process');
    execSync = cp.execSync;

    const ofetchModule = await import('ofetch');
    ofetch = ofetchModule.ofetch;

    prompts = await import('@clack/prompts');

    vi.clearAllMocks();
  });

  it('should generate a commit message and commit when confirmed', async () => {
    // Arrange: Mock functions and their return values
    const mockDiff = 'diff --git a/file.txt b/file.txt\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-hello\n+hello world';
    const mockCommitMessage = 'feat: update file.txt';

    // Mock git commands in correct order
    execSync
      .mockReturnValueOnce('main') // getCurrentBranch
      .mockReturnValueOnce('file.txt\n') // hasStagedChanges (git diff --cached --name-only)
      .mockReturnValueOnce(mockDiff) // getStagedDiff (git diff --cached)
      .mockReturnValueOnce('file.txt\n'); // hasStagedChanges check again

    // Mock fs operations for config
    const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      llmProvider: 'mastra',
      locale: 'en',
      maxCommitLength: 50,
      commitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
      enableEmojis: true,
      generateCount: 1,
      enableGitHook: false,
      enableHistory: true,
      historyLimit: 100,
    }));

    ofetch.mockResolvedValue({
      choices: [{ message: { content: mockCommitMessage } }],
    });
    prompts.text.mockResolvedValue(mockCommitMessage); // User confirms with edited message

    // Act: Dynamically import and run main function
    const { main } = await import('./index');
    await main();

    // Assert: Check if functions were called correctly
    expect(execSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' });
    expect(execSync).toHaveBeenCalledWith('git diff --cached --name-only', { encoding: 'utf-8' });
    expect(execSync).toHaveBeenCalledWith('git diff --cached', { encoding: 'utf-8' });
    expect(ofetch).toHaveBeenCalled();
    expect(prompts.text).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith(`git commit -m "${mockCommitMessage}"`, { encoding: 'utf-8' });
    expect(prompts.outro).toHaveBeenCalledWith(expect.stringContaining('Changes committed!'));
  });

  it('should cancel commit when not confirmed', async () => {
    // Arrange
    const mockDiff = 'diff --git a/file.txt b/file.txt';
    const mockCommitMessage = 'feat: update file.txt';

    execSync
      .mockReturnValueOnce('main') // getCurrentBranch
      .mockReturnValueOnce('file.txt\n') // hasStagedChanges
      .mockReturnValueOnce(mockDiff) // getStagedDiff
      .mockReturnValueOnce('file.txt\n'); // hasStagedChanges check again

    // Mock fs operations for config
    const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      llmProvider: 'mastra',
      locale: 'en',
      maxCommitLength: 50,
      commitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
      enableEmojis: true,
      generateCount: 1,
      enableGitHook: false,
      enableHistory: true,
      historyLimit: 100,
    }));

    ofetch.mockResolvedValue({
      choices: [{ message: { content: mockCommitMessage } }],
    });
    prompts.text.mockResolvedValue(null); // User cancels by returning null

    // Mock process.exit to prevent actual exit
    const mockExit = vi.fn();
    const originalExit = process.exit;
    process.exit = mockExit as any;

    try {
      // Act
      const { main } = await import('./index');
      await main();

      // Assert
      expect(execSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' });
      expect(execSync).toHaveBeenCalledWith('git diff --cached --name-only', { encoding: 'utf-8' });
      expect(execSync).toHaveBeenCalledWith('git diff --cached', { encoding: 'utf-8' });
      expect(ofetch).toHaveBeenCalled();
      expect(prompts.text).toHaveBeenCalled();
      expect(prompts.outro).toHaveBeenCalledWith(expect.stringContaining('Commit cancelled.'));
      expect(mockExit).toHaveBeenCalledWith(0);
    } finally {
      // Restore original process.exit
      process.exit = originalExit;
    }
  });
});
