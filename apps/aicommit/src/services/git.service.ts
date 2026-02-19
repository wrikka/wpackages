/**
 * Git service for git operations
 */

import { execSync } from 'node:child_process';
import { GitError } from '../error';

export class GitService {
  static getCurrentBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch (error) {
      throw new GitError('Failed to get current branch', error);
    }
  }

  static getStagedDiff(): string {
    try {
      return execSync('git diff --cached', { encoding: 'utf-8' });
    } catch (error) {
      throw new GitError('Failed to get staged diff', error);
    }
  }

  static hasStagedChanges(): boolean {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return output.trim().length > 0;
    } catch (error) {
      throw new GitError('Failed to check for staged changes', error);
    }
  }

  static commitWithMessage(message: string): void {
    try {
      if (!message) {
        throw new Error('Commit message cannot be empty');
      }
      execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
    } catch (error) {
      throw new GitError('Failed to commit changes', error);
    }
  }

  static isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { encoding: 'utf-8' });
      return true;
    } catch {
      return false;
    }
  }

  static getChangedFiles(): string[] {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return output.trim().split('\n').filter((file: string) => file.length > 0);
    } catch (error) {
      throw new GitError('Failed to get changed files', error);
    }
  }
}
