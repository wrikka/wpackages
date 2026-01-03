import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'node:child_process';

vi.mock('node:child_process', () => ({
    exec: vi.fn(),
}));

const mockExec = exec as vi.Mock;

const { createGitRepository } = await import('./git.service');

describe('GitService', () => {

    beforeEach(() => {
        mockExec.mockReset();
    });

    it('should parse git status correctly', async () => {
        const stdout = '## main...origin/main\n M src/services/git.service.ts\n?? src/services/git.service.test.ts';
        mockExec.mockImplementation((command, options, callback) => callback(null, { stdout, stderr: '' }));

        const repo = createGitRepository('.');
        const statusResult = await repo.status();

        expect(statusResult.success).toBe(true);
        const status = (statusResult as Extract<typeof statusResult, { success: true }>).value;

        expect(status.branch).toBe('main');
        // For ' M', the first char is the index status (' '), the second is the work-tree status ('M').
        expect(status.staged).toEqual([]);
        expect(status.modified).toEqual(['src/services/git.service.ts']);
        expect(status.untracked).toEqual(['src/services/git.service.test.ts']);
    });

    it('should parse git log correctly', async () => {
        const stdout = 'hash1|short1|author1|email1|1672531200|message1\nhash2|short2|author2|email2|1672617600|message2';
        mockExec.mockImplementation((command, options, callback) => callback(null, { stdout, stderr: '' }));

        const repo = createGitRepository('.');
        const logResult = await repo.log(2);

        expect(logResult.success).toBe(true);
        const commits = (logResult as Extract<typeof logResult, { success: true }>).value;

        expect(commits).toHaveLength(2);
        expect(commits[0].shortHash).toBe('short1');
        expect(commits[1].message).toBe('message2');
        expect(commits[0].date).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });

    it('should handle commit correctly', async () => {
        const commitMessage = 'feat: add new feature';
        const finalHash = 'a1b2c3d4';

        // First call for commit
        mockExec.mockImplementationOnce((command, options, callback) => callback(null, { stdout: '', stderr: '' }));
        // Second call for rev-parse
        mockExec.mockImplementationOnce((command, options, callback) => callback(null, { stdout: finalHash, stderr: '' }));

        const repo = createGitRepository('.');
        const commitResult = await repo.commit(commitMessage);

        expect(commitResult.success).toBe(true);
        const hash = (commitResult as Extract<typeof commitResult, { success: true }>).value;

        expect(hash).toBe(finalHash);
        expect(mockExec).toHaveBeenCalledWith(`git commit -m '${commitMessage}'`, expect.any(Object), expect.any(Function));
        expect(mockExec).toHaveBeenCalledWith('git rev-parse HEAD', expect.any(Object), expect.any(Function));
    });
});
