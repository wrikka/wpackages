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

    execSync.mockReturnValue(mockDiff); // for git diff
    ofetch.mockResolvedValue({
      choices: [{ message: { content: mockCommitMessage } }],
    });
    prompts.text.mockResolvedValue(mockCommitMessage); // User confirms with edited message

    // Act: Dynamically import and run the main function
    const { main } = await import('./index');
    await main();

    // Assert: Check if functions were called correctly
    expect(execSync).toHaveBeenCalledWith('git diff --staged', { stdio: 'pipe' });
    expect(ofetch).toHaveBeenCalled();
    expect(prompts.text).toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith(`git commit -m "${mockCommitMessage}"`, { stdio: 'pipe' });
    expect(prompts.outro).toHaveBeenCalledWith(expect.stringContaining('Changes committed!'));
  });

  it('should cancel commit when not confirmed', async () => {
    // Arrange
    const mockDiff = 'diff --git a/file.txt b/file.txt';
    const mockCommitMessage = 'feat: update file.txt';

    execSync.mockReturnValue(mockDiff);
    ofetch.mockResolvedValue({
      choices: [{ message: { content: mockCommitMessage } }],
    });
    prompts.text.mockResolvedValue(null); // User cancels by returning null

    // Act
    const { main } = await import('./index');
    await main();

    // Assert
    expect(execSync).toHaveBeenCalledWith('git diff --staged', { stdio: 'pipe' });
    expect(ofetch).toHaveBeenCalled();
    expect(prompts.text).toHaveBeenCalled();
    expect(prompts.outro).toHaveBeenCalledWith(expect.stringContaining('Commit cancelled.'));
  });
});
